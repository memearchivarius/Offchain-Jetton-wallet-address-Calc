const { Address, beginCell } = require("@ton/core")
const { TonClient, JettonMaster } = require("@ton/ton")

async function main() {
  const client = new TonClient({ endpoint: 'https://toncenter.com/api/v2/jsonRPC',});

  const USDTMasterAddress = Address.parse('EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs')  // EQC7aZ-_G_tWeSn0GZ0HclwZvGIBp-CRrSsbMibTHN6l4kr7
  const NOTMasterAddress = Address.parse('EQAvlWFDxGF2lXm67y4yzC17wYKD9A0guwPkMs1gOsM__NOT')   // EQA9idRBK7TY1AF0L2CpuxrwdjPr7qzKSQjbgakURWGQRdOW
  const HMSTRMasterAddress = Address.parse('EQAJ8uWd7EBqsmpSWaRdf_I-8R8-XHwh3gsNKhy-UrdrPcUo') // EQDXT5HaCnuwzBff8tjwAmGvs9N9MEbqOXDIY_KepS9yYyMo
  const DOGSMasterAddress = Address.parse('EQCvxJy4eG8hyHBFsZ7eePxrRsUQSFE_jpptRAYBmcG_DOGS')  // EQCRgs1d1M91dm2hHeF8luXBH-aIF9PT-T2jlocQXiYBvAGY
  const STONMasterAddress = Address.parse('EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO')  // EQCx5ruSqFmw5LYxJ6iksuCuRLsNpgTjWcCuW6jm8BhaLOTK
  const userAddress = Address.parse('UQDKHZ7e70CzqdvZCC83Z4WVR8POC_ZB0J1Y4zo88G-zCSRH') // Binance Hot Wallet
  
  const jettonMaster = client.open(JettonMaster.create(STONMasterAddress)) // Choose you hero
  console.log(await jettonMaster.getWalletAddress(userAddress))

}
  
main();