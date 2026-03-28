export default function StatusBadge({ status }: { status: any }) {
    if (!status) return null;

    let label = "Unknown";
    let colorClass = "bg-neutral-800 text-neutral-300";

    if (status.active) {
        label = "Active";
        colorClass = "bg-green-500/20 text-green-400 border border-green-500/30";
    } else if (status.witnessVoting) {
        label = "Witness Voting";
        colorClass = "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
    } else if (status.vetoPeriod) {
        label = "Veto Period";
        colorClass = "bg-orange-500/20 text-orange-400 border border-orange-500/30";
    } else if (status.executed) {
        label = "Executed";
        colorClass = "bg-neutral-800 text-neutral-400 border border-neutral-700";
    }

    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${colorClass}`}>
            {label}
        </span>
    );
}
