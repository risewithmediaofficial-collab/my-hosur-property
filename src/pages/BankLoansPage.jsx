import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightIcon, CheckCircleIcon, ChevronDownIcon } from "../components/AppIcons";
import SeoHead from "../components/SeoHead";
import LoanCalculator from "../components/LoanCalculator";
import { bankLoans } from "../constants/bankLoans";

const BankLoansPage = () => {
  const [selectedBank, setSelectedBank] = useState(bankLoans[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <>
      <SeoHead
        title="Bank Home Loans - Compare Rates & Calculate EMI"
        description="Compare home loan rates from SBI, PNB, HDFC, LIC, IDBI, Can Fin Homes, and Aditya Birla Capital. Use our EMI calculator to review monthly payments and total interest."
        keywords="home loans, bank loans, EMI calculator, loan rates, SBI, PNB, HDFC, LIC, IDBI, Can Fin Homes, Aditya Birla Capital"
      />

      {/* Static Hero Section */}
      <section className="px-5 py-8 sm:px-8 lg:px-10 bg-white border-b border-slate-200/80">
        <div className="mx-auto max-w-[1440px]">
          <h1 className="text-3xl font-black leading-tight sm:text-4xl lg:text-5xl text-navy">Bank Home Loans</h1>
          <p className="mt-2 max-w-3xl text-sm sm:text-base text-slate-500 font-medium">
            Compare Interest Rates & Calculate Your EMI
          </p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="px-5 py-10 sm:px-8 lg:px-10 bg-slate-50 min-h-[calc(100vh-220px)] flex items-center">
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.9fr] gap-8 items-start">
            {/* Left Column: Bank Selection & Details */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  Choose Bank
                </label>
                <div className="relative">
                  {/* Custom animated dropdown button */}
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base font-semibold text-slate-700 shadow-sm outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all duration-200 text-left animate-btn"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-xl">{selectedBank.logo}</span>
                      <span>{selectedBank.name}</span>
                    </span>
                    <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Dropdown panel */}
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <>
                        {/* Invisible backdrop to capture outside clicks */}
                        <div
                          className="fixed inset-0 z-40 cursor-default"
                          onClick={() => setIsDropdownOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className="absolute left-0 right-0 z-50 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden py-1 max-h-[300px] overflow-y-auto"
                        >
                          {bankLoans.map((bank) => (
                            <button
                              key={bank.id}
                              type="button"
                              onClick={() => {
                                setSelectedBank(bank);
                                setIsDropdownOpen(false);
                              }}
                              className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold transition-colors duration-150 ${
                                selectedBank.id === bank.id
                                  ? "bg-navy/5 text-navy font-bold"
                                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                              }`}
                            >
                              <span className="text-xl w-6 text-center">{bank.logo}</span>
                              <span>{bank.name}</span>
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Bank Details Card */}
              <div className="rounded-2xl border border-slate-200/80 p-6 bg-white shadow-sm space-y-5">
                <div className="flex items-center gap-4">
                  <span className="text-4xl bg-slate-100 w-16 h-16 rounded-xl flex items-center justify-center border border-slate-200/40">
                    {selectedBank.logo}
                  </span>
                  <div>
                    <h3 className="text-xl font-black text-navy leading-tight">{selectedBank.name}</h3>
                    <p className="text-sm text-slate-500 font-semibold mt-0.5">{selectedBank.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Interest Rate</p>
                    <p className="text-base font-extrabold text-navy mt-1">{selectedBank.minRate}% - {selectedBank.maxRate}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-bold">Processing Fee</p>
                    <p className="text-base font-extrabold text-green-600 mt-1">{selectedBank.processingFee}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Max Loan Amount</p>
                    <p className="text-base font-extrabold text-purple-600 mt-1">{selectedBank.maxLoanAmount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Loan Tenure</p>
                    <p className="text-base font-extrabold text-slate-700 mt-1">Up to 30 yrs</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Key Features</h4>
                  <ul className="space-y-2">
                    {selectedBank.features.map((feature, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2.5">
                        <CheckCircleIcon className="w-5 h-5 text-navy flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Column: Loan Calculator */}
            <div className="rounded-2xl border border-slate-200/80 p-1 bg-white shadow-sm">
              <LoanCalculator bank={selectedBank} onBankChange={setSelectedBank} showBankSelector={false} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BankLoansPage;
