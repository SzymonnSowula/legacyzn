import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { LegacyLockProgram } from "../target/types/legacy_lock_program";

describe("legacy-lock", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.LegacyLockProgram as Program<LegacyLockProgram>;
  
  it("Is initialized!", async () => {
    const owner = provider.wallet.publicKey;
    const beneficiary = anchor.web3.Keypair.generate();
    const witness = anchor.web3.Keypair.generate();

    const tx = await program.methods
      .initializeVault(
        180, // inactivityThresholdDays
        30,  // vetoPeriodDays
        1,   // witnessThreshold
        [{ pubkey: beneficiary.publicKey, shareBps: 10000, solClaimed: false }],
        [witness.publicKey]
      )
      .rpc();
      
    console.log("Your transaction signature", tx);
  });
});
