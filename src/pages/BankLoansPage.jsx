import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRightIcon, CheckCircleIcon } from "../components/AppIcons";
import SeoHead from "../components/SeoHead";
import PageHero from "../components/PageHero";
import PageSection from "../components/PageSection";
import LoanCalculator from "../components/LoanCalculator";
import { bankLoans } from "../constants/bankLoans";

const BankLoansPage = () => {
  const [selectedBank, setSelectedBank] = useState(bankLoans[0]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <>
      <SeoHead
        title="Bank Home Loans - Compare Rates & Calculate EMI"
        description="Compare home loan rates from SBI, PNB, HDFC, LIC, IDBI, Can Fin Homes, and Aditya Birla Capital. Use our EMI calculator to review monthly payments and total interest."
        keywords="home loans, bank loans, EMI calculator, loan rates, SBI, PNB, HDFC, LIC, IDBI, Can Fin Homes, Aditya Birla Capital"
      />

      {/* Hero Section */}
      <PageHero
        title="Bank Home Loans"
        subtitle="Compare Interest Rates & Calculate Your EMI"
      />

      {/* Main Content */}
      <PageSection>
        <div className="space-y-16">
          {/* Bank Information Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:grid-cols-3"
          >
            {bankLoans.map((bank) => (
              <motion.div
                key={bank.id}
                variants={itemVariants}
                onClick={() => setSelectedBank(bank)}
                whileHover={{ y: -8 }}
                className={`group cursor-pointer rounded-2xl p-6 transition-all duration-300 ${
                  selectedBank.id === bank.id
                    ? `bg-gradient-to-br ${bank.color} shadow-2xl ring-2 ring-offset-2 ring-white`
                    : "bg-gradient-to-br from-slate-100 to-slate-50 hover:shadow-xl"
                }`}
              >
                <div className="text-4xl mb-3">{bank.logo}</div>
                <h3 className={`text-lg font-bold mb-2 ${selectedBank.id === bank.id ? "text-white" : "text-slate-900"}`}>
                  {bank.shortName}
                </h3>
                <p className={`text-sm mb-3 ${selectedBank.id === bank.id ? "text-white/80" : "text-slate-600"}`}>
                  {bank.description}
                </p>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  selectedBank.id === bank.id
                    ? "bg-white/20 text-white"
                    : "bg-blue-100 text-blue-700"
                }`}>
                  {bank.minRate}% - {bank.maxRate}%
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Loan Calculator */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <LoanCalculator bank={selectedBank} onBankChange={setSelectedBank} />
          </motion.div>

          {/* Detailed Bank Information */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">Bank Details & Features</h2>

            {bankLoans.map((bank) => (
              <motion.div
                key={bank.id}
                variants={itemVariants}
                className={`rounded-2xl p-8 transition-all duration-300 ${
                  selectedBank.id === bank.id
                    ? `bg-gradient-to-br ${bank.color} text-white shadow-2xl`
                    : "bg-slate-50 border border-slate-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-6">
                  <div className="text-5xl">{bank.logo}</div>
                  <div className="flex-1">
                    <h3 className={`text-2xl font-bold mb-2 ${selectedBank.id === bank.id ? "text-white" : "text-slate-900"}`}>
                      {bank.name}
                    </h3>
                    <p className={selectedBank.id === bank.id ? "text-white/80" : "text-slate-600"}>
                      {bank.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={`p-4 rounded-lg ${
                    selectedBank.id === bank.id
                      ? "bg-white/10 backdrop-blur-sm"
                      : "bg-blue-50"
                  }`}>
                    <p className={`text-sm font-medium mb-2 ${
                      selectedBank.id === bank.id ? "text-white/80" : "text-slate-600"
                    }`}>
                      Interest Rate
                    </p>
                    <p className={`text-2xl font-bold ${
                      selectedBank.id === bank.id ? "text-white" : "text-blue-600"
                    }`}>
                      {bank.minRate}% - {bank.maxRate}%
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg ${
                    selectedBank.id === bank.id
                      ? "bg-white/10 backdrop-blur-sm"
                      : "bg-green-50"
                  }`}>
                    <p className={`text-sm font-medium mb-2 ${
                      selectedBank.id === bank.id ? "text-white/80" : "text-slate-600"
                    }`}>
                      Processing Fee
                    </p>
                    <p className={`text-2xl font-bold ${
                      selectedBank.id === bank.id ? "text-white" : "text-green-600"
                    }`}>
                      {bank.processingFee}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg ${
                    selectedBank.id === bank.id
                      ? "bg-white/10 backdrop-blur-sm"
                      : "bg-purple-50"
                  }`}>
                    <p className={`text-sm font-medium mb-2 ${
                      selectedBank.id === bank.id ? "text-white/80" : "text-slate-600"
                    }`}>
                      Max Loan Amount
                    </p>
                    <p className={`text-2xl font-bold ${
                      selectedBank.id === bank.id ? "text-white" : "text-purple-600"
                    }`}>
                      {bank.maxLoanAmount}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, amount: 0.2 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">Why Choose a Bank Loan?</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Competitive Rates",
                  description: "Get the best interest rates starting from 6.7% per annum with flexible terms.",
                },
                {
                  title: "Quick Approval",
                  description: "Fast loan processing with minimal documentation and quick disbursement.",
                },
                {
                  title: "Flexible Tenure",
                  description: "Choose from 5 to 20 years tenure based on your repayment capacity.",
                },
                {
                  title: "Easy EMI Calculator",
                  description: "Use our advanced calculator to plan your finances effectively.",
                },
                {
                  title: "Tax Benefits",
                  description: "Claim tax deductions on principal and interest under Section 80C.",
                },
                {
                  title: "Expert Support",
                  description: "Get guidance from our experts throughout the loan process.",
                },
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex gap-4 items-start"
                >
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="w-6 h-6 text-blue-600 mt-1" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{benefit.title}</h3>
                    <p className="text-slate-600">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Calculator Tips */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, amount: 0.2 }}
            className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 md:p-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">How to Use the Calculator?</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: 1,
                  title: "Select Your Bank",
                  description:
                    "Choose from SBI, PNB, HDFC, LIC, IDBI, Can Fin Homes, or Aditya Birla Capital. Each lender has different rates and terms.",
                },
                {
                  step: 2,
                  title: "Enter Loan Amount",
                  description: "Slide to select your desired loan amount between ₹5 Lakhs and ₹100 Lakhs.",
                },
                {
                  step: 3,
                  title: "Adjust Interest Rate",
                  description:
                    "Set the interest rate within the bank's range. Higher rates mean higher EMI and vice versa.",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 text-white rounded-full font-bold text-2xl mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600">{item.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-orange-200 space-y-3">
              <h4 className="font-semibold text-slate-900">Additional Tips:</h4>
              <ul className="space-y-2 text-slate-600">
                <li>• Consider your income and monthly expenses before finalizing the loan amount</li>
                <li>• Longer tenure means lower EMI but higher total interest amount</li>
                <li>• Compare different banks' rates using our calculator to get the best deal</li>
                <li>• Always check for hidden charges and processing fees before applying</li>
              </ul>
            </div>
          </motion.div>

          {/* Bank Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, amount: 0.2 }}
            className="bg-white rounded-2xl p-5 sm:p-8 shadow-lg"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">Bank Comparison</h2>
            <div className="space-y-4 md:hidden">
              {bankLoans.map((bank) => (
                <div key={bank.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">{bank.shortName}</h3>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                      {bank.minRate}% - {bank.maxRate}%
                    </span>
                  </div>
                  <div className="mb-3">
                    <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                      {bank.description}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-500">Processing Fee</p>
                      <p className="font-medium text-slate-900">{bank.processingFee}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Max Loan</p>
                      <p className="font-medium text-slate-900">{bank.maxLoanAmount}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Max Tenure</p>
                      <p className="font-medium text-slate-900">{bank.maxTenure}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Type</p>
                      <p className="font-medium text-slate-900">{bank.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm md:text-base">
                <thead>
                  <tr className="border-b-2 border-slate-300">
                    <th className="text-left py-4 px-4 font-semibold text-slate-900">Bank</th>
                    <th className="text-center py-4 px-4 font-semibold text-slate-900">Bank Type</th>
                    <th className="text-center py-4 px-4 font-semibold text-slate-900">Interest Rate</th>
                    <th className="text-center py-4 px-4 font-semibold text-slate-900">Processing Fee</th>
                    <th className="text-center py-4 px-4 font-semibold text-slate-900">Max Loan</th>
                    <th className="text-center py-4 px-4 font-semibold text-slate-900">Max Tenure</th>
                  </tr>
                </thead>
                <tbody>
                  {bankLoans.map((bank, index) => (
                    <tr key={bank.id} className={`border-b ${index % 2 === 0 ? "bg-slate-50" : "bg-white"} hover:bg-blue-50 transition`}>
                      <td className="py-4 px-4 font-semibold text-slate-900">{bank.shortName}</td>
                      <td className="text-center py-4 px-4 text-slate-600">{bank.description}</td>
                      <td className="text-center py-4 px-4">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                          {bank.minRate}% - {bank.maxRate}%
                        </span>
                      </td>
                      <td className="text-center py-4 px-4 text-slate-600">{bank.processingFee}</td>
                      <td className="text-center py-4 px-4 text-slate-600">{bank.maxLoanAmount}</td>
                      <td className="text-center py-4 px-4 text-slate-600">{bank.maxTenure}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Eligibility & Requirements */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, amount: 0.2 }}
            className="space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Eligibility & Requirements</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:grid-cols-3">
              {bankLoans.map((bank) => (
                <motion.div
                  key={bank.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className={`rounded-2xl p-6 bg-gradient-to-br ${bank.color} text-white shadow-lg`}
                >
                  <h3 className="text-xl font-bold mb-4">{bank.shortName}</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold opacity-80 mb-2">Eligibility:</p>
                      <ul className="text-sm space-y-1">
                        {bank.eligibility.map((item, idx) => (
                          <li key={idx} className="flex gap-2">
                            <span>•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, amount: 0.2 }}
            className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 md:p-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">Frequently Asked Questions</h2>

            <div className="space-y-4">
              {[
                {
                  q: "What is EMI and how is it calculated?",
                  a: "EMI (Equated Monthly Installment) is the fixed amount you need to pay every month towards your loan. It includes both principal and interest components. Our calculator uses the standard EMI formula: EMI = [P × r × (1 + r)^n] / [(1 + r)^n - 1], where P is principal, r is monthly interest rate, and n is tenure in months.",
                },
                {
                  q: "What documents are required for a home loan?",
                  a: "Typically, you'll need: Identity proof, Address proof, Income proof (salary slip, ITR), Property documents, Sanction letter from local authority, NOC from municipal corporation, and Bank statements for last 6 months.",
                },
                {
                  q: "Can I prepay my home loan?",
                  a: "Yes, most banks allow prepayment of home loans. Many banks have no prepayment penalty, but some may charge a small percentage. Prepayment helps reduce total interest and tenure. Check with your bank for specific prepayment terms.",
                },
                {
                  q: "Is there any tax benefit on home loans?",
                  a: "Yes! You can claim tax deduction under Section 80C for principal repayment (up to ₹1.5 lakhs per year) and Section 24(b) for interest paid (up to ₹2 lakhs per year) on your home loan.",
                },
                {
                  q: "What is a processing fee?",
                  a: "Processing fee is charged by banks for processing your loan application. It typically ranges from 0.5% to 1.5% of the loan amount and is deducted from the loan amount at disbursal.",
                },
                {
                  q: "How long does loan approval take?",
                  a: "Loan approval typically takes 3-7 working days after complete documentation. Some banks offer faster processing for salaried employees. Online loan applications may be quicker than traditional methods.",
                },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition"
                >
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{faq.q}</h3>
                  <p className="text-slate-600 leading-relaxed">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, amount: 0.2 }}
            className="text-center py-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Ready to Apply for a Loan?</h2>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              Get expert guidance from our team to find the best loan option that suits your financial needs.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-xl transition-all duration-300"
            >
              Contact Our Experts <ArrowRightIcon className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </PageSection>
    </>
  );
};

export default BankLoansPage;
