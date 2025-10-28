import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Search, SortAsc, SortDesc, Users, ChevronDown, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, ArrowUpRight, Repeat, Droplets } from 'lucide-react';

// Helper functions for date manipulation
const formatDate = (date) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const d = new Date(date);
  return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}, ${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const subDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
};

// Hardcoded mock data
const MOCK_TRANSACTIONS = [
  {
    hash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12',
    assets: ['ETH', 'USDT'],
    amount: 1250.50,
    amountUsd: 1250.50,
    fee: 2.50,
    feeUsd: 2.50,
    type: 'transfer',
    createdAt: new Date('2025-10-22T14:30:00'),
    status: 'completed'
  },
  {
    hash: '0x2b3c4d5e6f7890abcdef1234567890abcdef1234',
    assets: ['BTC', 'ETH'],
    amount: 5420.75,
    amountUsd: 5420.75,
    fee: 5.20,
    feeUsd: 5.20,
    type: 'swap',
    createdAt: new Date('2025-10-22T12:15:00'),
    status: 'completed'
  },
  {
    hash: '0x3c4d5e6f7890abcdef1234567890abcdef123456',
    assets: ['USDC'],
    amount: 850.00,
    amountUsd: 850.00,
    fee: 1.50,
    feeUsd: 1.50,
    type: 'spray',
    createdAt: new Date('2025-10-21T18:45:00'),
    status: 'completed'
  },
  {
    hash: '0x4d5e6f7890abcdef1234567890abcdef12345678',
    assets: ['ETH'],
    amount: 3200.25,
    amountUsd: 3200.25,
    fee: 3.80,
    feeUsd: 3.80,
    type: 'transfer',
    createdAt: new Date('2025-10-21T09:20:00'),
    status: 'completed'
  },
  {
    hash: '0x5e6f7890abcdef1234567890abcdef1234567890',
    assets: ['DAI', 'USDT'],
    amount: 2100.00,
    amountUsd: 2100.00,
    fee: 2.20,
    feeUsd: 2.20,
    type: 'swap',
    createdAt: new Date('2025-10-20T16:00:00'),
    status: 'completed'
  }
];

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

const StatComponent = ({ currency, title, value, percentage, icon: Icon, onClick }) => (
  <div
    onClick={onClick}
    className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 cursor-pointer hover:border-[#3a3a3a] transition-colors"
  >
    <div className="flex items-center justify-between mb-4">
      <span className="text-gray-400 text-sm">{title}</span>
      <Icon className="text-gray-500" size={20} />
    </div>
    <div className="flex items-end justify-between">
      <div>
        <div className="text-2xl font-semibold text-white">
          {currency}{typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {percentage !== 0 && (
          <div className={`flex items-center mt-2 text-sm ${percentage > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {percentage > 0 ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
            {Math.abs(percentage)}%
          </div>
        )}
      </div>
    </div>
  </div>
);

const DropdownComponent = ({ options, renderIcon, renderOption, selectedValue, setSelectedValue, placeHolder }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3.5 text-white flex items-center gap-2 hover:border-[#3a3a3a] transition-colors min-w-[140px] justify-between"
      >
        <span className="flex items-center gap-2">
          {renderIcon()}
          {selectedValue || placeHolder}
        </span>
        <ChevronDown size={16} />
      </button>
      {isOpen && (
        <div className="absolute top-full mt-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg py-2 min-w-[140px] z-10">
          {options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedValue(option);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-white hover:bg-[#2a2a2a] transition-colors"
            >
              {renderOption(option)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const DurationSelectorComponent = ({ onUpdated }) => {
  const durations = ['Today', 'Last 7 days', 'Last 30 days', 'Last 90 days'];
  const [selected, setSelected] = useState('Last 7 days');

  const handleChange = (duration) => {
    setSelected(duration);
    const now = new Date();
    let start = startOfDay(now);

    if (duration === 'Today') start = startOfDay(now);
    else if (duration === 'Last 7 days') start = startOfDay(subDays(now, 7));
    else if (duration === 'Last 30 days') start = startOfDay(subDays(now, 30));
    else if (duration === 'Last 90 days') start = startOfDay(subDays(now, 90));

    onUpdated({ start, end: endOfDay(now), duration });
  };

  return (
    <DropdownComponent
      options={durations}
      renderIcon={() => <></>}
      renderOption={(option) => <span>{option}</span>}
      selectedValue={selected}
      setSelectedValue={handleChange}
      placeHolder="Duration"
    />
  );
};

const TransactionRow = ({ transaction }) => {
  const getTypeIcon = (type) => {
    switch(type) {
      case 'transfer': return <ArrowUpRight size={16} className="text-blue-500" />;
      case 'swap': return <Repeat size={16} className="text-purple-500" />;
      case 'spray': return <Droplets size={16} className="text-green-500" />;
      default: return null;
    }
  };

  return (
    <tr className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors">
      <td className="py-4 px-4 text-gray-300">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">{transaction.hash.slice(0, 10)}...{transaction.hash.slice(-8)}</span>
        </div>
      </td>
      <td className="py-4 px-4 text-gray-300">
        <div className="flex gap-1">
          {transaction.assets.map((asset, idx) => (
            <span key={idx} className="bg-[#2a2a2a] px-2 py-1 rounded text-xs">{asset}</span>
          ))}
        </div>
      </td>
      <td className="py-4 px-4 text-white font-medium">
        ${transaction.amountUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
      <td className="py-4 px-4 text-gray-300">
        ${transaction.feeUsd.toFixed(2)}
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2 capitalize">
          {getTypeIcon(transaction.type)}
          <span className="text-gray-300">{transaction.type}</span>
        </div>
      </td>
      <td className="py-4 px-4 text-gray-400 text-sm">
        {formatDate(transaction.createdAt)}
      </td>
    </tr>
  );
};

const PaginationComponent = ({ meta, page, limit, onPageChange }) => {
  const totalPages = meta.lastPage;

  return (
    <div className="flex items-center justify-between mt-6 text-sm">
      <div className="text-gray-400">
        Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, meta.total)} of {meta.total} results
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1, limit)}
          disabled={page === 1}
          className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#3a3a3a] transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-gray-400">Page {page} of {totalPages}</span>
        <button
          onClick={() => onPageChange(page + 1, limit)}
          disabled={page === totalPages}
          className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#3a3a3a] transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState({
    totaltransactions: { value: 0, percentage: 0 },
    totaltransfers: { value: 0, percentage: 0 },
    totalswaps: { value: 0, percentage: 0 },
    totalsprays: { value: 0, percentage: 0 },
    totalFeeUsd: { value: 0, percentage: 0 },
  });
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [aggregateMethod, setAggregateMethod] = useState('sum');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [meta, setMeta] = useState({ total: 0, lastPage: 1 });
  const [duration, setDuration] = useState({
    start: startOfDay(subDays(new Date(), 7)),
    end: endOfDay(new Date()),
    duration: 'Last 7 days',
  });

  const handlePageChange = (newPage, newLimit) => {
    setPage(newPage);
    setLimit(newLimit);
  };

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const getFilter = () => {
    const typeFilter = type === 'all' ? {} : { type };
    switch (selectedFilter) {
      case 'earliest':
        return { order_by: 'createdAt', order: 'asc', ...typeFilter };
      case 'latest':
        return { order_by: 'createdAt', order: 'desc', ...typeFilter };
      case 'largest':
        return { order_by: 'erc20_amount_usd', order: 'desc', ...typeFilter };
      case 'smallest':
        return { order_by: 'erc20_amount_usd', order: 'asc', ...typeFilter };
      default:
        return { order_by: 'createdAt', order: 'desc', ...typeFilter };
    }
  };

  useEffect(() => {
    let filtered = [...MOCK_TRANSACTIONS];

    if (type !== 'all') {
      filtered = filtered.filter(t => t.type === type);
    }

    if (debouncedSearchTerm) {
      filtered = filtered.filter(t =>
        t.hash.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        t.assets.some(a => a.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
      );
    }

    const filter = getFilter();
    if (filter.order_by === 'createdAt') {
      filtered.sort((a, b) => {
        const diff = a.createdAt.getTime() - b.createdAt.getTime();
        return filter.order === 'asc' ? diff : -diff;
      });
    } else if (filter.order_by === 'erc20_amount_usd') {
      filtered.sort((a, b) => {
        const diff = a.amountUsd - b.amountUsd;
        return filter.order === 'asc' ? diff : -diff;
      });
    }

    setMeta({
      total: filtered.length,
      lastPage: Math.ceil(filtered.length / limit)
    });

    const startIdx = (page - 1) * limit;
    const endIdx = startIdx + limit;
    setTransactions(filtered.slice(startIdx, endIdx));

    const totalAmount = MOCK_TRANSACTIONS.reduce((sum, t) => sum + t.amountUsd, 0);
    const transferAmount = MOCK_TRANSACTIONS.filter(t => t.type === 'transfer').reduce((sum, t) => sum + t.amountUsd, 0);
    const swapAmount = MOCK_TRANSACTIONS.filter(t => t.type === 'swap').reduce((sum, t) => sum + t.amountUsd, 0);
    const sprayAmount = MOCK_TRANSACTIONS.filter(t => t.type === 'spray').reduce((sum, t) => sum + t.amountUsd, 0);

    const transferCount = MOCK_TRANSACTIONS.filter(t => t.type === 'transfer').length;
    const swapCount = MOCK_TRANSACTIONS.filter(t => t.type === 'swap').length;
    const sprayCount = MOCK_TRANSACTIONS.filter(t => t.type === 'spray').length;

    setAnalytics({
      totaltransactions: {
        value: aggregateMethod === 'sum' ? totalAmount : MOCK_TRANSACTIONS.length,
        percentage: 12
      },
      totaltransfers: {
        value: aggregateMethod === 'sum' ? transferAmount : transferCount,
        percentage: 8
      },
      totalswaps: {
        value: aggregateMethod === 'sum' ? swapAmount : swapCount,
        percentage: 15
      },
      totalsprays: {
        value: aggregateMethod === 'sum' ? sprayAmount : sprayCount,
        percentage: -5
      },
    });
  }, [debouncedSearchTerm, selectedFilter, page, limit, type, duration, aggregateMethod]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex md:justify-between md:flex-row flex-col gap-y-[20px]">
          <div>
            <h2 className="font-medium text-2xl text-white">Transactions</h2>
            <h4 className="font-light mt-2 text-gray-400">
              Here is a list of all transactions carried out on Peniwallet
            </h4>
          </div>
          <div className="grid gap-[10px] grid-cols-[max-content_1fr]">
            <DropdownComponent
              options={['count', 'sum']}
              renderIcon={() => <></>}
              renderOption={(option) => (
                <span>Volume by{option === 'count' ? ' number' : ' amount'}</span>
              )}
              selectedValue={aggregateMethod}
              setSelectedValue={setAggregateMethod}
              placeHolder="Aggregate"
            />
            <DurationSelectorComponent onUpdated={(d) => setDuration(d)} />
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatComponent
            currency={aggregateMethod === 'sum' ? '$' : ''}
            title="Total Transactions"
            value={analytics.totaltransactions.value}
            percentage={analytics.totaltransactions.percentage}
            icon={ArrowRightLeft}
            onClick={() => setType('all')}
          />
          <StatComponent
            currency={aggregateMethod === 'sum' ? '$' : ''}
            title="Total Transfer"
            value={analytics.totaltransfers.value}
            percentage={analytics.totaltransfers.percentage}
            icon={ArrowUpRight}
            onClick={() => setType('transfer')}
          />
          <StatComponent
            currency={aggregateMethod === 'sum' ? '$' : ''}
            title="Total Swap"
            value={analytics.totalswaps.value}
            percentage={analytics.totalswaps.percentage}
            icon={Repeat}
            onClick={() => setType('swap')}
          />
          <StatComponent
            currency={aggregateMethod === 'sum' ? '$' : ''}
            title="Total Spray"
            value={analytics.totalsprays.value}
            percentage={analytics.totalsprays.percentage}
            icon={Users}
            onClick={() => setType('spray')}
          />
        </div>

        <nav className="mt-10">
          <div className="grid grid-cols-[1fr_max-content] gap-4 justify-between">
            <div className="col-span-2 md:col-span-1 max-w-[500px]">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg pl-10 pr-4 py-3.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#3a3a3a]"
                  placeholder="Search Transactions"
                  value={searchTerm}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="items-center justify-end flex gap-4">
              <DropdownComponent
                options={['all', 'transfer', 'swap', 'spray']}
                renderIcon={() => <></>}
                renderOption={(option) => <span className="capitalize">{option}</span>}
                selectedValue={type}
                setSelectedValue={setType}
                placeHolder="Type"
              />
              <DropdownComponent
                options={[null, 'latest', 'earliest', 'largest', 'smallest']}
                renderIcon={() => (
                  <>
                    {selectedFilter === 'earliest' && <SortAsc size={16} />}
                    {selectedFilter === 'latest' && <SortDesc size={16} />}
                  </>
                )}
                renderOption={(option) => (
                  <span className="capitalize">{option || 'Clear sort'}</span>
                )}
                selectedValue={selectedFilter}
                setSelectedValue={setSelectedFilter}
                placeHolder="Sort"
              />
            </div>
          </div>
        </nav>

        <div className="mt-4 overflow-auto text-sm">
          <table className="w-full min-w-[100px]">
            <thead>
              <tr className="text-left bg-[#1a1a1a]">
                <th className="min-w-[150px] py-5 px-4 font-medium text-white rounded-tl-lg">
                  Transaction Hash
                </th>
                <th className="min-w-[150px] py-5 px-4 font-medium text-white">Asset(s)</th>
                <th className="min-w-[120px] py-5 px-4 font-medium text-white">Amount</th>
                <th className="min-w-[120px] py-5 px-4 font-medium text-white">Fee</th>
                <th className="min-w-[120px] py-5 px-4 font-medium text-white">Type</th>
                <th className="py-5 px-4 font-medium text-white rounded-tr-lg">Created</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <TransactionRow key={transaction.hash} transaction={transaction} />
              ))}
              {transactions.length === 0 && !isLoading && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center text-neutral-600 text-sm py-6 border-b border-[#2a2a2a]"
                  >
                    There is nothing here yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <PaginationComponent
          meta={meta}
          page={page}
          limit={limit}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default Transactions;
