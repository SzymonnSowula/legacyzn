use anchor_lang::prelude::*;

declare_id!("B4QKvj7amSGWUKeiGvkfHBsEEfycR7MoDFgowmYKEebw");
#[program]
pub mod legacy_lock_program {
    use super::*;


    pub fn initialize_legacy_lock(
        ctx: Context<InitializeLegacyLock>,
        session_key: Pubkey,
        inactivity_threshold: i64,
        veto_period: i64,
        required_confirmations: u8,
    ) -> Result<()> {
        let legacy_lock = &mut ctx.accounts.legacy_lock;
        let clock = Clock::get()?;


        legacy_lock.owner = ctx.accounts.user.key();
        legacy_lock.session_key = session_key;
        legacy_lock.last_ping = clock.unix_timestamp;
        legacy_lock.inactivity_threshold = inactivity_threshold;
        legacy_lock.veto_period = veto_period;
        legacy_lock.confirmations = 0; // Zaczynamy od 0 potwierdzeń
        legacy_lock.required_confirmations = required_confirmations;
        legacy_lock.status = LegacyStatus::Active;
        legacy_lock.veto_deadline = 0;
        legacy_lock.bump = ctx.bumps.legacy_lock;


        emit!(LegacyLockCreated {
            lock_pubkey: legacy_lock.key(),
            owner: legacy_lock.owner,
            session_key: legacy_lock.session_key,
        });

        Ok(())
    }

    pub fn ping_alive(ctx: Context<PingAlive>) -> Result<()> {
        let legacy_lock = &mut ctx.accounts.legacy_lock;
        require!(
            legacy_lock.status == LegacyStatus::Active,
            ErrorCode::NotActive
        );
        let clock = Clock::get()?;
        legacy_lock.last_ping = clock.unix_timestamp;
        
        emit!(AlivePingReceived {
            owner: legacy_lock.owner,
            timestamp: legacy_lock.last_ping,
        });
        Ok(())
    }

    pub fn confirm_inactivity(ctx: Context<ConfirmInactivity>) -> Result<()> {
        let legacy_lock = &mut ctx.accounts.legacy_lock;
        require!(
            legacy_lock.status == LegacyStatus::Active,
            ErrorCode::NotActive
        );

        let clock = Clock::get()?;
        require!(
            clock.unix_timestamp - legacy_lock.last_ping > legacy_lock.inactivity_threshold,
            ErrorCode::ThresholdNotReached
        );

        legacy_lock.confirmations += 1;

        if legacy_lock.confirmations >= legacy_lock.required_confirmations {
            legacy_lock.status = LegacyStatus::VetoPeriod;
            legacy_lock.veto_deadline = clock.unix_timestamp + legacy_lock.veto_period;

            emit!(VetoPeriodStarted {
                owner: legacy_lock.owner,
                veto_deadline: legacy_lock.veto_deadline,
            });
        }

        Ok(())
    }
}


#[derive(Accounts)]
pub struct InitializeLegacyLock<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + LegacyLock::INIT_SPACE,
        seeds = [b"legacy_lock", user.key().as_ref()],
        bump
    )]
    pub legacy_lock: Account<'info, LegacyLock>,
   
    #[account(mut)]
    pub user: Signer<'info>,
   
    pub system_program: Program<'info, System>,
}


#[account]
#[derive(InitSpace)]
pub struct LegacyLock {
    pub owner: Pubkey,
    pub session_key: Pubkey,
    pub last_ping: i64,
    pub inactivity_threshold: i64,
    pub veto_period: i64,
    pub confirmations: u8,
    pub required_confirmations: u8,
    pub status: LegacyStatus,
    pub veto_deadline: i64,
    pub bump: u8,
}


#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum LegacyStatus {
    Active,
    VetoPeriod,
    Executed,
}


#[event]
pub struct LegacyLockCreated {
    pub lock_pubkey: Pubkey,
    pub owner: Pubkey,
    pub session_key: Pubkey,
}

#[derive(Accounts)]
pub struct PingAlive<'info> {
    #[account(
        mut,
        has_one = session_key
    )]
    pub legacy_lock: Account<'info, LegacyLock>,
    pub session_key: Signer<'info>,
}

#[derive(Accounts)]
pub struct ConfirmInactivity<'info> {
    #[account(mut)]
    pub legacy_lock: Account<'info, LegacyLock>,
    pub signer: Signer<'info>,
}

#[event]
pub struct AlivePingReceived {
    pub owner: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct VetoPeriodStarted {
    pub owner: Pubkey,
    pub veto_deadline: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Status is not active.")]
    NotActive,
    #[msg("Inactivity threshold not reached.")]
    ThresholdNotReached,
}