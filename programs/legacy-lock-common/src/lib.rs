1: use anchor_lang::prelude::*;
2: 
3: pub const VAULT_SEED: &[u8] = b"vault";
4: 
5: #[account]
6: #[derive(InitSpace)]
7: pub struct LegacyVault {
8:     pub owner: Pubkey,
9:     pub session_key: Pubkey,
10:     pub last_ping_ts: i64,
11:     pub inactivity_threshold_days: u16,
12:     pub veto_period_days: u16,
13:     pub witness_threshold: u8,
14:     pub witnesses_confirmed: u8,
15:     pub status: VaultStatus,
16:     pub veto_deadline: i64,
17:     pub total_locked_sol: u64,
18:     pub bump: u8,
19: }
20: 
21: #[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace, Copy)]
22: pub enum VaultStatus {
23:     Active,
24:     WitnessVoting,
25:     VetoPeriod,
26:     Executed,
27: }
28: 
29: #[account]
30: #[derive(InitSpace)]
31: pub struct BeneficiaryList {
32:     pub vault: Pubkey,
33:     pub bump: u8,
34:     #[max_len(10)]
35:     pub entries: Vec<BeneficiaryEntry>,
36: }
37: 
38: #[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
39: pub struct BeneficiaryEntry {
40:     pub pubkey: Pubkey,
41:     pub share_bps: u16,
42:     pub sol_claimed: bool,
43: }
44: 
45: impl LegacyVault {
46:     pub fn is_within_activity_window(&self, now: i64) -> bool {
47:         let threshold_secs = (self.inactivity_threshold_days as i64) * 86400;
48:         now - self.last_ping_ts <= threshold_secs
49:     }
50: 
51:     pub fn is_veto_deadline_passed(&self, now: i64) -> bool {
52:         self.status == VaultStatus::VetoPeriod && now > self.veto_deadline
53:     }
54: 
55:     pub fn has_session_key(&self) -> bool {
56:         self.session_key != Pubkey::default()
57:     }
58: }
59: 
60: impl BeneficiaryList {
61:     pub const SEED_PREFIX: &'static [u8] = b"beneficiaries";
62: 
63:     pub fn validate_shares(&self) -> bool {
64:         let mut total: u16 = 0;
65:         for entry in &self.entries {
66:             total += entry.share_bps;
67:         }
68:         total == 10000
69:     }
70: }
