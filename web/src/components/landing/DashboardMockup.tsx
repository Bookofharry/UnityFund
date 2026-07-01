import { motion } from 'framer-motion';

// Pure-CSS, code-generated dashboard mockup.
// No images — instant load, crisp at any DPI, animatable.

function StatusBadge({ status }: { status: 'active' | 'completed' | 'pending' }) {
  const styles = {
    active:    'bg-emerald-50 text-emerald-700',
    completed: 'bg-gray-100 text-gray-500',
    pending:   'bg-amber-50 text-amber-700',
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}

function ProgressBar({ pct, color = 'indigo' }: { pct: number; color?: string }) {
  return (
    <div className="h-1 w-full rounded-full bg-gray-100">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, delay: 0.8, ease: 'easeOut' }}
        className={`h-1 rounded-full ${color === 'emerald' ? 'bg-emerald-500' : 'bg-indigo-500'}`}
      />
    </div>
  );
}

export function DashboardMockup() {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-navy">
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 border-b border-gray-100 bg-gray-50 px-4 py-3">
        <div className="h-2.5 w-2.5 rounded-full bg-red-400" aria-hidden="true" />
        <div className="h-2.5 w-2.5 rounded-full bg-amber-400" aria-hidden="true" />
        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" aria-hidden="true" />
        <div className="ml-3 flex-1 rounded-md bg-gray-200 px-3 py-1 text-[10px] text-gray-400">
          app.unityfund.io/dashboard
        </div>
      </div>

      {/* App layout */}
      <div className="flex" style={{ minHeight: 360 }}>
        {/* Sidebar */}
        <div className="hidden w-36 shrink-0 border-r border-gray-100 bg-white py-4 sm:block">
          <div className="mb-4 px-4">
            <p className="text-xs font-bold text-navy-500">UnityFund</p>
            <p className="mt-0.5 truncate text-[10px] text-gray-400">Lagos Teachers Co-op</p>
          </div>
          {['Dashboard', 'Funds', 'Contributions', 'Members', 'Payouts', 'Reports'].map((item, i) => (
            <div
              key={item}
              className={`px-4 py-1.5 text-[10px] font-medium ${
                i === 0
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {item}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-hidden p-4">
          {/* Stats row */}
          <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: 'Active Funds', value: '3' },
              { label: 'Members', value: '84' },
              { label: 'Collected', value: '₦1.8M' },
              { label: 'Outstanding', value: '₦420K' },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-gray-100 p-3">
                <p className="text-[10px] text-gray-400">{label}</p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="mt-0.5 text-sm font-bold text-navy-800"
                >
                  {value}
                </motion.p>
              </div>
            ))}
          </div>

          {/* Funds table */}
          <div className="mb-3 rounded-xl border border-gray-100">
            <div className="border-b border-gray-100 px-3 py-2">
              <p className="text-[10px] font-semibold text-gray-400">ACTIVE FUNDS</p>
            </div>
            {[
              { name: 'Annual Dues 2026', status: 'active' as const, pct: 96, color: 'indigo' },
              { name: 'Member Welfare Fund', status: 'active' as const, pct: 72, color: 'emerald' },
              { name: 'Monthly Contributions', status: 'active' as const, pct: 55, color: 'indigo' },
            ].map(({ name, status, pct, color }) => (
              <div key={name} className="border-b border-gray-50 px-3 py-2 last:border-0">
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-[11px] font-medium text-gray-700">{name}</p>
                  <StatusBadge status={status} />
                </div>
                <div className="flex items-center gap-2">
                  <ProgressBar pct={pct} color={color} />
                  <span className="shrink-0 text-[10px] text-gray-400">{pct}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Activity feed */}
          <div className="rounded-xl border border-gray-100 px-3 py-2">
            <p className="mb-2 text-[10px] font-semibold text-gray-400">RECENT ACTIVITY</p>
            {[
              { name: 'Amaka Okafor', action: 'paid ₦5,000', time: '2 min ago', dot: 'bg-emerald-400' },
              { name: 'Tunde Bakare', action: 'paid ₦5,000', time: '18 min ago', dot: 'bg-emerald-400' },
              { name: 'Ngozi Chukwu', action: 'payment pending', time: '1 hr ago', dot: 'bg-amber-400' },
            ].map(({ name, action, time, dot }) => (
              <div key={name} className="mb-1.5 flex items-center gap-2 last:mb-0">
                <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} aria-hidden="true" />
                <p className="flex-1 text-[10px] text-gray-500">
                  <span className="font-medium text-gray-700">{name}</span> {action}
                </p>
                <span className="text-[10px] text-gray-300">{time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
