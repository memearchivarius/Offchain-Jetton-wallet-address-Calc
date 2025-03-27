import { Address, beginCell, Cell, storeStateInit } from "@ton/core";
import { TonClient, JettonMaster } from "@ton/ton";
import axios, { AxiosResponse } from "axios";

async function runGetmethod(method: string, master: Address, address: Address) {
  const client = new TonClient({
    endpoint: "https://toncenter.com/api/v2/jsonRPC",
  });
  const userAddressCell = beginCell().storeAddress(address).endCell();
  const response = await client.runMethod(master, method, [
    { type: "slice", cell: userAddressCell },
  ]);
  return response;
}

async function getLib(libhash: string, testnet: boolean): Promise<Cell> {
  // gets a library by its hash from dton's graphql
  const dtonEndpoint = `https://${
    testnet ? "testnet." : ""
  }dton.io/BHGVv2jIwNoDbUz_DVbZ1mOwMoUKluze/graphql`;
  const graphqlQuery = {
    query: `
          query fetchAuthor {
              get_lib(lib_hash: "${libhash}")
          }
      `,
    variables: {},
  };
  try {
    const res = await axios.post(dtonEndpoint, graphqlQuery, {
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json",
      },
    });
    console.log("Response data:", res.data);
    const libB64 = res.data.data.get_lib;
    if (!libB64) {
      throw new Error("Library not found for hash: " + libhash);
    }
    return Cell.fromBase64(libB64);
  } catch (error) {
    console.error("Error fetching library:", error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    throw error;
  }
}

async function calcREGstateinit(
  owner: Address,
  master: Address,
  code: Cell,
  status?: number,
  root?: bigint,
  salt?: bigint
): Promise<Cell> {
  const dataCell = beginCell();

  // Add status first if it exists
  if (status !== undefined) {
    dataCell.storeUint(status, 4);
  }

  // Then balance
  dataCell.storeCoins(0);

  // Then addresses
  dataCell.storeAddress(owner).storeAddress(master);

  // Then root if it exists
  if (root !== undefined) {
    dataCell.storeUint(root, 256);
  }

  // Then salt if it exists
  if (salt !== undefined) {
    dataCell.storeUint(salt, 10);
  }

  return beginCell()
    .storeUint(0, 2) // 0b00 - No split_depth; No special
    .storeMaybeRef(code) // code
    .storeMaybeRef(dataCell.endCell()) // data
    .storeUint(0, 1) // empty libs
    .endCell();
}

async function calcUSDTstateinit(
  owner: Address,
  master: Address,
  code: Cell
): Promise<Cell> {
  return beginCell()
    .storeUint(0, 2) // 0b00 - No split_depth; No special
    .storeMaybeRef(code) // code
    .storeMaybeRef(
      beginCell()
        .storeUint(0, 4) // status
        .storeCoins(0) // balance
        .storeAddress(owner)
        .storeAddress(master)
        .endCell()
    ) // data
    .storeUint(0, 1) // empty libs
    .endCell();
}

async function calcHMSTRstateinit(
  owner: Address,
  master: Address,
  code: Cell,
  root: bigint,
  salt: bigint
): Promise<Cell> {
  return beginCell()
    .storeUint(0, 2) // 0b00 - No split_depth; No special
    .storeMaybeRef(code) // code
    .storeMaybeRef(
      beginCell()
        .storeUint(0, 4) // status
        .storeCoins(0) // balance
        .storeAddress(owner)
        .storeAddress(master)
        .storeUint(root, 256) // .get_mintless_airdrop_hashmap_root
        .storeUint(salt, 10)
        .endCell()
    ) // data
    .storeUint(0, 1) // empty libs
    .endCell();
}

async function main() {
  const client = new TonClient({
    endpoint: "https://toncenter.com/api/v2/jsonRPC",
  });

  const USDTMasterAddress = Address.parse(
    "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs"
  ); // EQC7aZ-_G_tWeSn0GZ0HclwZvGIBp-CRrSsbMibTHN6l4kr7
  const NOTMasterAddress = Address.parse(
    "EQAvlWFDxGF2lXm67y4yzC17wYKD9A0guwPkMs1gOsM__NOT"
  ); // EQA9idRBK7TY1AF0L2CpuxrwdjPr7qzKSQjbgakURWGQRdOW
  const HMSTRMasterAddress = Address.parse(
    "EQAJ8uWd7EBqsmpSWaRdf_I-8R8-XHwh3gsNKhy-UrdrPcUo"
  ); // EQDXT5HaCnuwzBff8tjwAmGvs9N9MEbqOXDIY_KepS9yYyMo
  const DOGSMasterAddress = Address.parse(
    "EQCvxJy4eG8hyHBFsZ7eePxrRsUQSFE_jpptRAYBmcG_DOGS"
  ); // EQCRgs1d1M91dm2hHeF8luXBH-aIF9PT-T2jlocQXiYBvAGY
  const STONMasterAddress = Address.parse(
    "EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO"
  ); // EQCx5ruSqFmw5LYxJ6iksuCuRLsNpgTjWcCuW6jm8BhaLOTK
  const userAddress = Address.parse(
    "UQDKHZ7e70CzqdvZCC83Z4WVR8POC_ZB0J1Y4zo88G-zCSRH"
  ); // Binance Hot Wallet

  const jettonMaster = client.open(JettonMaster.create(HMSTRMasterAddress));

  try {
    const jettonData = await jettonMaster.getJettonData();
    const hamster_stack = await runGetmethod(
      "get_wallet_state_init_and_salt",
      HMSTRMasterAddress,
      userAddress
    );
    // console.log("Raw stack1:", hamster_stack.stack);
    const hamster_salt = hamster_stack.stack.skip().readBigNumber();
    console.log("hamster_salt:", hamster_salt);

    // Increase wait time to avoid rate limit
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const hamster_root = await runGetmethod(
      "get_mintless_airdrop_hashmap_root",
      HMSTRMasterAddress,
      userAddress
    );
    // console.log("Raw stack2:", hamster_root.stack);

    // Skip the cell and read the integer value
    const hamster_merkle = hamster_root.stack.skip().readBigNumber();
    console.log("hamster_merkle:", hamster_merkle);

    if (jettonData && jettonData.walletCode) {
      const walletCode = jettonData.walletCode;
      console.log("Wallet Code:", walletCode);

      const jettonWalletStateInit = calcREGstateinit(
        userAddress,
        HMSTRMasterAddress,
        walletCode,
        0,
        hamster_merkle,
        hamster_salt
      );
      const userJettonWalletAddress = new Address(
        0,
        (await jettonWalletStateInit).hash()
      );
      console.log("Jetton Wallet:", userJettonWalletAddress);
      console.log("State Init:", jettonWalletStateInit);
    }
  } catch (error) {
    console.error("Error details:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

main();
