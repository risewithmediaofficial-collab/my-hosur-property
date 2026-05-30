import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDownIcon } from "./AppIcons";
import { bankLoans } from "../constants/bankLoans";

const LoanCalculator = ({ bank, onBankChange }) => {
  const [loanAmount, setLoanAmount] = useState(25); // in lakhs
  const [interestRate, setInterestRate] = useState((bank.minRate + bank.maxRate) / 2);
  const [tenure, setTenure] = useState(180); // 15 years in months
  const [processingFeePercent, setProcessingFeePercent] = useState(0.75);
  const [showAmortization, setShowAmortization] = useState(false);
  const selectedBank = bankLoans.find((item) => item.id === bank?.id) || bankLoans[0];

  useEffect(() => {
    setInterestRate((selectedBank.minRate + selectedBank.maxRate) / 2);
  }, [selectedBank.id, selectedBank.minRate, selectedBank.maxRate]);

  // Calculate EMI and total interest with processing fee
  const calculations = useMemo(() => {
    const principal = loanAmount * 100000; // Convert lakhs to rupees
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = tenure;

    if (monthlyRate === 0) {
      const emi = principal / numberOfPayments;
      return {
        emi: emi,
        totalAmount: emi * numberOfPayments,
        totalInterest: 0,
        principal: principal,
        processingFee: (principal * processingFeePercent) / 100,
      };
    }

    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const totalAmount = emi * numberOfPayments;
    const totalInterest = totalAmount - principal;
    const processingFee = (principal * processingFeePercent) / 100;

    return {
      emi: emi,
      totalAmount: totalAmount,
      totalInterest: totalInterest,
      principal: principal,
      processingFee: processingFee,
      totalWithProcessingFee: totalAmount + processingFee,
    };
  }, [loanAmount, interestRate, tenure, processingFeePercent]);

  // Generate amortization schedule
  const amortizationSchedule = useMemo(() => {
    const principal = calculations.principal;
    const monthlyRate = interestRate / 100 / 12;
    const schedule = [];
    let balance = principal;

    for (let month = 1; month <= tenure; month++) {
      const interest = balance * monthlyRate;
      const principal_payment = calculations.emi - interest;
      balance -= principal_payment;

      if (month === 1 || month % 12 === 0 || month === tenure) {
        schedule.push({
          month,
          year: Math.ceil(month / 12),
          emi: calculations.emi,
          principal: principal_payment,
          interest: interest,
          balance: Math.max(0, balance),
        });
      }
    }

    return schedule;
  }, [calculations, tenure, interestRate]);

  const formatCurrency = (value) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`;
    }
    return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  };

  const tenures = [
    { label: "5 yr", value: 60 },
    { label: "10 yr", value: 120 },
    { label: "15 yr", value: 180 },
    { label: "20 yr", value: 240 },
  ];

  // Create years breakdown data
  const yearsBreakdown = useMemo(() => {
    const data = [];
    const monthlyRate = interestRate / 100 / 12;
    let balance = calculations.principal;

    for (let year = 1; year <= Math.ceil(tenure / 12); year++) {
      let yearlyInterest = 0;
      let yearlyPrincipal = 0;

      for (let month = 0; month < 12 && balance > 0; month++) {
        const interest = balance * monthlyRate;
        const principal_payment = calculations.emi - interest;
        yearlyInterest += interest;
        yearlyPrincipal += principal_payment;
        balance -= principal_payment;
      }

      data.push({
        year,
        interest: yearlyInterest,
        principal: yearlyPrincipal,
      });
    }

    return data;
  }, [calculations, tenure, interestRate]);

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
      >
        {/* Bank Selection */}
        <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-slate-200">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">Loan Calculator</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {bankLoans.map((bankOption) => (
              <motion.button
                key={bankOption.id}
                onClick={() => {
                  onBankChange(bankOption);
                  setInterestRate((bankOption.minRate + bankOption.maxRate) / 2);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className={`p-3 sm:p-4 rounded-xl font-semibold transition-all duration-300 min-w-0 ${
                  selectedBank.id === bankOption.id
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg ring-2 ring-blue-300"
                    : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="text-sm mb-1">{bankOption.shortName}</div>
                <div className="text-[11px] sm:text-xs opacity-75">
                  {bankOption.minRate}%-{bankOption.maxRate}%
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Calculator Body */}
        <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 bg-white">
          {/* Loan Amount Slider */}
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-end">
              <label className="text-lg font-semibold text-slate-900">Loan Amount</label>
              <span className="text-2xl sm:text-3xl font-bold text-blue-600 break-words">{formatCurrency(loanAmount * 100000)}</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              style={{
                background: `linear-gradient(to right, rgb(59, 130, 246) 0%, rgb(59, 130, 246) ${
                  ((loanAmount - 5) / 95) * 100
                }%, rgb(226, 232, 240) ${((loanAmount - 5) / 95) * 100}%, rgb(226, 232, 240) 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-slate-600 font-medium">
              <span>₹5 L</span>
              <span>₹100 L</span>
            </div>
          </div>

          {/* Interest Rate Slider */}
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-end">
              <label className="text-lg font-semibold text-slate-900">Interest Rate (%)</label>
              <span className="text-2xl sm:text-3xl font-bold text-green-600">{interestRate.toFixed(2)}%</span>
            </div>
            <input
              type="range"
              min={selectedBank.minRate}
              max={selectedBank.maxRate}
              step="0.01"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-500"
              style={{
                background: `linear-gradient(to right, rgb(34, 197, 94) 0%, rgb(34, 197, 94) ${
                  ((interestRate - selectedBank.minRate) / (selectedBank.maxRate - selectedBank.minRate)) * 100
                }%, rgb(226, 232, 240) ${
                  ((interestRate - selectedBank.minRate) / (selectedBank.maxRate - selectedBank.minRate)) * 100
                }%, rgb(226, 232, 240) 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-slate-600 font-medium">
              <span>{selectedBank.minRate}%</span>
              <span>{selectedBank.maxRate}%</span>
            </div>
          </div>

          {/* Tenure Selection */}
          <div className="space-y-4">
            <label className="text-lg font-semibold text-slate-900 block">Loan Tenure</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {tenures.map((t) => (
                <motion.button
                  key={t.value}
                  onClick={() => setTenure(t.value)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                    tenure === t.value
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                  }`}
                >
                  {t.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Processing Fee Slider */}
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-end">
              <label className="text-lg font-semibold text-slate-900">Processing Fee</label>
              <span className="text-xl sm:text-2xl font-bold text-orange-600 break-words">{processingFeePercent.toFixed(2)}% ({formatCurrency(calculations.processingFee)})</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.25"
              value={processingFeePercent}
              onChange={(e) => setProcessingFeePercent(Number(e.target.value))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              style={{
                background: `linear-gradient(to right, rgb(234, 179, 8) 0%, rgb(234, 179, 8) ${
                  (processingFeePercent / 2) * 100
                }%, rgb(226, 232, 240) ${(processingFeePercent / 2) * 100}%, rgb(226, 232, 240) 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-slate-600 font-medium">
              <span>0%</span>
              <span>2%</span>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-6 border-t border-slate-200">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200"
            >
              <p className="text-slate-600 text-sm mb-2">Monthly EMI</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-700 break-words">
                {formatCurrency(calculations.emi)}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200"
            >
              <p className="text-slate-600 text-sm mb-2">Total Interest</p>
              <p className="text-xl sm:text-2xl font-bold text-amber-700 break-words">
                {formatCurrency(calculations.totalInterest)}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200"
            >
              <p className="text-slate-600 text-sm mb-2">Total Amount</p>
              <p className="text-xl sm:text-2xl font-bold text-green-700 break-words">
                {formatCurrency(calculations.totalAmount)}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200"
            >
              <p className="text-slate-600 text-sm mb-2">Processing Fee</p>
              <p className="text-xl sm:text-2xl font-bold text-orange-700 break-words">
                {formatCurrency(calculations.processingFee)}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200"
            >
              <p className="text-slate-600 text-sm mb-2">Total Outgo</p>
              <p className="text-xl sm:text-2xl font-bold text-red-700 break-words">
                {formatCurrency(calculations.totalWithProcessingFee)}
              </p>
            </motion.div>
          </div>

          {/* Loan Summary */}
          <div className="bg-slate-50 p-6 rounded-xl space-y-3 border border-slate-200">
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Loan Summary</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-600 mb-1">Principal Amount</p>
                <p className="text-slate-900 font-semibold">{formatCurrency(calculations.principal)}</p>
              </div>
              <div>
                <p className="text-slate-600 mb-1">Loan Tenure</p>
                <p className="text-slate-900 font-semibold">{tenure} months ({(tenure / 12).toFixed(1)} years)</p>
              </div>
              <div>
                <p className="text-slate-600 mb-1">Interest Rate</p>
                <p className="text-slate-900 font-semibold">{interestRate.toFixed(2)}% p.a.</p>
              </div>
              <div>
                <p className="text-slate-600 mb-1">Total Interest</p>
                <p className="text-amber-700 font-semibold">{formatCurrency(calculations.totalInterest)}</p>
              </div>
              <div>
                <p className="text-slate-600 mb-1">Processing Fee</p>
                <p className="text-orange-700 font-semibold">{formatCurrency(calculations.processingFee)}</p>
              </div>
              <div>
                <p className="text-slate-600 mb-1">Monthly EMI</p>
                <p className="text-blue-700 font-semibold">{formatCurrency(calculations.emi)}</p>
              </div>
              <div>
                <p className="text-slate-600 mb-1">Total Payable</p>
                <p className="text-green-700 font-semibold">{formatCurrency(calculations.totalAmount)}</p>
              </div>
              <div>
                <p className="text-slate-600 mb-1">Total Outgo</p>
                <p className="text-red-700 font-semibold">{formatCurrency(calculations.totalWithProcessingFee)}</p>
              </div>
            </div>
          </div>

          {/* Year-wise Breakdown Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-slate-50 p-6 rounded-xl space-y-4 border border-slate-200"
          >
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Year-wise Payment Breakdown</h4>
            <div className="space-y-3">
              {yearsBreakdown.slice(0, 5).map((year, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-700">Year {year.year}</span>
                    <span className="text-slate-900 font-semibold">{formatCurrency(year.principal + year.interest)}</span>
                  </div>
                  <div className="flex gap-2 h-6 rounded-full overflow-hidden bg-slate-200">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-400 flex items-center justify-center text-xs font-bold text-white"
                      style={{ width: `${(year.principal / (year.principal + year.interest)) * 100}%` }}
                    >
                      {(year.principal / (year.principal + year.interest)) * 100 > 10 && "Principal"}
                    </div>
                    <div
                      className="bg-gradient-to-r from-amber-500 to-amber-400 flex items-center justify-center text-xs font-bold text-white"
                      style={{ width: `${(year.interest / (year.principal + year.interest)) * 100}%` }}
                    >
                      {(year.interest / (year.principal + year.interest)) * 100 > 10 && "Interest"}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 px-1">
                    <span>Principal: {formatCurrency(year.principal)}</span>
                    <span>Interest: {formatCurrency(year.interest)}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Amortization Schedule Toggle */}
          <motion.button
            onClick={() => setShowAmortization(!showAmortization)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-slate-200 to-slate-100 hover:from-slate-300 hover:to-slate-200 text-slate-900 py-4 px-6 rounded-xl font-semibold flex items-center justify-between transition-all duration-300 border border-slate-300"
          >
            <span>
              {showAmortization ? "Hide" : "View"} Detailed Payment Schedule
            </span>
            <motion.div
              animate={{ rotate: showAmortization ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDownIcon className="w-5 h-5" />
            </motion.div>
          </motion.button>

          {/* Amortization Schedule */}
          {showAmortization && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-50 p-4 sm:p-6 rounded-xl overflow-x-auto border border-slate-200"
            >
              <h4 className="text-lg font-semibold text-slate-900 mb-4">Payment Schedule</h4>
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-300">
                    <th className="text-left py-2 px-2 text-slate-700 font-semibold">Month</th>
                    <th className="text-right py-2 px-2 text-slate-700 font-semibold">EMI</th>
                    <th className="text-right py-2 px-2 text-slate-700 font-semibold">Principal</th>
                    <th className="text-right py-2 px-2 text-slate-700 font-semibold">Interest</th>
                    <th className="text-right py-2 px-2 text-slate-700 font-semibold">Balance</th>
                  </tr>
                </thead>
                <tbody className="max-h-96 overflow-y-auto">
                  {amortizationSchedule.map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-blue-50 transition">
                      <td className="py-2 px-2 text-slate-700">{row.month} ({row.year}y)</td>
                      <td className="text-right py-2 px-2 text-blue-700 font-semibold">{formatCurrency(row.emi)}</td>
                      <td className="text-right py-2 px-2 text-green-700 font-semibold">{formatCurrency(row.principal)}</td>
                      <td className="text-right py-2 px-2 text-amber-700 font-semibold">{formatCurrency(row.interest)}</td>
                      <td className="text-right py-2 px-2 text-slate-900">{formatCurrency(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Disclaimer */}
      <div className="mt-6 px-4 space-y-3">
        <p className="text-center text-sm text-slate-600 bg-slate-100 p-4 rounded-lg border border-slate-200">
          *This is an approximate calculation. Actual EMI may vary based on bank's policies, processing fees, insurance charges, and other levies.
        </p>
        <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 border border-blue-200">
          <p className="font-semibold mb-2">💡 Pro Tips:</p>
          <ul className="space-y-1 text-xs">
            <li>• Longer tenure reduces monthly EMI but increases total interest paid</li>
            <li>• Most banks offer better rates for higher loan amounts</li>
            <li>• Pre-payment options can help reduce total interest burden</li>
            <li>• Check for insurance coverage and waiver options</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoanCalculator;
