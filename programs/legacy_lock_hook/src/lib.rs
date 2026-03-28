use anchor_lang::prelude::*;

// To jest tylko bazowy wpis / zalążek dla programu Token-2022 Transfer Hook.
// Prawdziwa implementacja dojdzie w następnych krokach (wymaga dopięcia Token2022 z Anchor).

declare_id!("EP1HPZqUhFsLCXWLR9rzfXYr8KMEQTnEafHjBxf1FyYP");

#[program]
pub mod legacy_lock_hook {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
