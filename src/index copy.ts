import { Address, beginCell, Cell } from "@ton/core";
import { TonClient, JettonMaster } from "@ton/ton";
import axios, { AxiosResponse } from "axios";

async function getLib(libhash: string, testnet: boolean): Promise<Cell> {
  // gets a library by its hash from dton's graphql
  const dtonEndpoint = `https://${testnet ? "testnet." : ""}dton.io/BHGVv2jIwNoDbUz_DVbZ1mOwMoUKluze/graphql`;
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
        "Accept": "application/json"
      },
    });
    console.log("Response data:", res.data);
    const libB64 = res.data.data.get_lib;
    if (!libB64) {
        throw new Error('Library not found for hash: ' + libhash);
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

/*
const jettonWalletStateInit = beginCell().store(storeStateInit({
  code: JETTON_WALLET_CODE,
  data: beginCell()
      .storeCoins(0)
      .storeAddress(USER_ADDRESS)
      .storeAddress(JETTON_MASTER_ADDRESS)
      .storeRef(JETTON_WALLET_CODE)
      .endCell()
}))
.endCell();
const userJettonWalletAddress = new Address(0, jettonWalletStateInit.hash())
*/

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

  const jettonMaster = client.open(JettonMaster.create(USDTMasterAddress));

  try {
    const jettonData = await jettonMaster.getJettonData();
    console.log("Full Jetton Data:", jettonData);

    if (jettonData && jettonData.walletCode) {
      const walletCode = jettonData.walletCode;
      console.log("Wallet Code:", walletCode);
      
      // Get the hash of the wallet code
      const walletCodeHash = walletCode.hash().toString("hex");
      // const hash = 'b5ee9c72010101010023000842028f452d7a4dfd74066b682365177259ed05734435be76b5fd4bd5d8af2b7c3d68'
      //              b5ee9c72410101010023000842028f452d7a4dfd74066b682365177259ed05734435be76b5fd4bd5d8af2b7c3d68206bbf76
      console.log("Wallet Code Hash:", walletCodeHash);

      // Try to get the library cell using the hash
      const libraryCell = await getLib(walletCodeHash, false); // false for mainnet
      console.log("Is Library Cell:", libraryCell !== null);
    }
  } catch (error) {
    console.error("Error fetching jetton data:", error);
  }
}

main();
