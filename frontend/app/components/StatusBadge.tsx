export default function StatusBadge({ status }: { status: Record<string, boolean> }) {
    if (!status) return null;

    let label = "Unknown";
    let colorClass = "bg-white/5 text-white/40 border-white/10";

    if (status.active) {
        label = "Active";
        colorClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    } else if (status.witnessVoting) {
        label = "Witness Voting";
        colorClass = "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    } else if (status.vetoPeriod) {
        label = "Veto Period";
        colorClass = "bg-orange-500/10 text-orange-400 border-orange-500/20";
    } else if (status.executed) {
        label = "Executed";
        colorClass = "bg-white/10 text-white/60 border-white/20";
    }

    return (
        <span className={`px-4 py-1.5 text-[9px] font-mono font-bold uppercase tracking-widest border ${colorClass} rounded-full backdrop-blur-md`}>
            {label}
        </span>
    );
}
