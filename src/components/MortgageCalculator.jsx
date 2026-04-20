import { useState } from 'react'

const MortgageCalculator = ({ isOpen, onClose }) => {
    const [propertyPrice, setPropertyPrice] = useState(2500000)
    const [downPaymentPercent, setDownPaymentPercent] = useState(20)
    const [interestRate, setInterestRate] = useState(7.0)
    const [loanTermYears, setLoanTermYears] = useState(30)

    if (!isOpen) return null

    const calculateMortgage = () => {
        const principal = propertyPrice * (1 - downPaymentPercent / 100)
        const monthlyRate = interestRate / 100 / 12
        const numberOfPayments = loanTermYears * 12
        
        const monthlyPayment = principal * 
            (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
            (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
        
        return {
            monthlyPayment: Math.round(monthlyPayment),
            downPayment: propertyPrice * (downPaymentPercent / 100),
            loanAmount: principal,
            totalInterest: (monthlyPayment * numberOfPayments) - principal,
            totalCost: (monthlyPayment * numberOfPayments) + (propertyPrice * (downPaymentPercent / 100))
        }
    }

    const mortgageCalc = calculateMortgage()

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value)
    }

    return (
        <div className="calculator-modal-overlay" onClick={onClose}>
            <div className="calculator-modal" onClick={(e) => e.stopPropagation()}>
                <button className="calculator-modal-close" onClick={onClose}>×</button>
                
                <h2 className="calculator-title">
                    Mortgage Calculator
                </h2>
                <p className="calculator-subtitle">
                    Estimate your monthly payments and total costs
                </p>

                <div className="calculator-inputs">
                    {/* Property Price */}
                    <div className="calculator-input-group">
                        <label className="calculator-label">
                            Property Price
                        </label>
                        <div className="calculator-input-wrapper">
                            <span className="calculator-input-prefix">$</span>
                            <input
                                type="number"
                                min="100000"
                                max="50000000"
                                step="50000"
                                value={propertyPrice}
                                onChange={(e) => setPropertyPrice(Number(e.target.value))}
                                className="calculator-input"
                            />
                        </div>
                        <input
                            type="range"
                            min="100000"
                            max="10000000"
                            step="50000"
                            value={propertyPrice}
                            onChange={(e) => setPropertyPrice(Number(e.target.value))}
                            className="calculator-range"
                        />
                    </div>

                    {/* Down Payment */}
                    <div className="calculator-input-group">
                        <label className="calculator-label">
                            Down Payment: {downPaymentPercent}% ({formatCurrency(mortgageCalc.downPayment)})
                        </label>
                        <input
                            type="range"
                            min="5"
                            max="50"
                            step="5"
                            value={downPaymentPercent}
                            onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                            className="calculator-range"
                        />
                    </div>

                    {/* Interest Rate */}
                    <div className="calculator-input-group">
                        <label className="calculator-label">
                            Interest Rate
                        </label>
                        <div className="calculator-input-wrapper">
                            <input
                                type="number"
                                min="1"
                                max="15"
                                step="0.1"
                                value={interestRate}
                                onChange={(e) => setInterestRate(Number(e.target.value))}
                                className="calculator-input"
                                style={{ paddingLeft: '1rem' }}
                            />
                            <span className="calculator-input-suffix">%</span>
                        </div>
                    </div>

                    {/* Loan Term */}
                    <div className="calculator-input-group">
                        <label className="calculator-label">
                            Loan Term: {loanTermYears} years
                        </label>
                        <input
                            type="range"
                            min="10"
                            max="30"
                            step="5"
                            value={loanTermYears}
                            onChange={(e) => setLoanTermYears(Number(e.target.value))}
                            className="calculator-range"
                        />
                    </div>
                </div>

                {/* Result */}
                <div className="calculator-result">
                    <div className="calculator-result-label">
                        Estimated Monthly Payment
                    </div>
                    <div className="calculator-result-value">
                        {formatCurrency(mortgageCalc.monthlyPayment)}
                    </div>
                    
                    <div className="calculator-breakdown">
                        <div className="breakdown-item">
                            <span className="breakdown-label">Down Payment</span>
                            <span className="breakdown-value">
                                {formatCurrency(mortgageCalc.downPayment)}
                            </span>
                        </div>
                        <div className="breakdown-item">
                            <span className="breakdown-label">Loan Amount</span>
                            <span className="breakdown-value">
                                {formatCurrency(mortgageCalc.loanAmount)}
                            </span>
                        </div>
                        <div className="breakdown-item">
                            <span className="breakdown-label">Total Interest</span>
                            <span className="breakdown-value">
                                {formatCurrency(mortgageCalc.totalInterest)}
                            </span>
                        </div>
                        <div className="breakdown-item">
                            <span className="breakdown-label">Total Cost</span>
                            <span className="breakdown-value">
                                {formatCurrency(mortgageCalc.totalCost)}
                            </span>
                        </div>
                    </div>
                </div>

                <p className="calculator-disclaimer">
                    * This calculator provides an estimate. Actual payments may vary based on 
                    taxes, insurance, HOA fees, and other factors. Consult with a financial 
                    advisor for accurate calculations.
                </p>
            </div>
        </div>
    )
}

export default MortgageCalculator