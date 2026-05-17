"use client"

import { useState } from "react"
import { StepSelectDetails } from "./StepSelectDetails"
import { StepConfirm } from "./StepConfirm"
import { StepPayment } from "./StepPayment"
import { DonationSuccess } from "./DonationSuccess"

export type WizardStep = "details" | "confirm" | "payment" | "success"

export interface DonationSelections {
  hospitalId: string
  hospitalName: string
  mealTimeId: string
  mealTimeName: string
  donationDate: string
}

export interface CompletedDonation {
  id: string
  referenceNumber: string
}

interface InitialValues {
  hospitalId?: string
  mealTimeId?: string
  date?: string
}

interface Props {
  hospitals: { id: string; name: string; location: string }[]
  mealTimes: { id: string; name: string; timeString: string }[]
  initialValues?: InitialValues
}

export function DonationWizard({ hospitals, mealTimes, initialValues }: Props) {
  const [step, setStep] = useState<WizardStep>("details")
  const [selections, setSelections] = useState<DonationSelections | null>(null)
  const [donation, setDonation] = useState<CompletedDonation | null>(null)

  function handleDetailsComplete(data: DonationSelections) {
    setSelections(data)
    setStep("confirm")
  }

  function handleDonationCreated(d: CompletedDonation) {
    setDonation(d)
    setStep("payment")
  }

  function handlePaymentComplete() {
    setStep("success")
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Step indicator */}
      <StepIndicator current={step} />

      <div className="mt-8">
        {step === "details" && (
          <StepSelectDetails
            hospitals={hospitals}
            mealTimes={mealTimes}
            onComplete={handleDetailsComplete}
            initialValues={initialValues}
          />
        )}
        {step === "confirm" && selections && (
          <StepConfirm
            selections={selections}
            onBack={() => setStep("details")}
            onDonationCreated={handleDonationCreated}
          />
        )}
        {step === "payment" && donation && selections && (
          <StepPayment
            donation={donation}
            selections={selections}
            onComplete={handlePaymentComplete}
          />
        )}
        {step === "success" && donation && (
          <DonationSuccess referenceNumber={donation.referenceNumber} />
        )}
      </div>
    </div>
  )
}

const STEPS: WizardStep[] = ["details", "confirm", "payment", "success"]
const STEP_LABELS: Record<WizardStep, string> = {
  details: "1",
  confirm: "2",
  payment: "3",
  success: "4",
}

function StepIndicator({ current }: { current: WizardStep }) {
  const currentIdx = STEPS.indexOf(current)
  return (
    <div className="flex items-center justify-center gap-2">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
              i <= currentIdx
                ? "bg-emerald-600 text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {STEP_LABELS[step]}
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`h-0.5 w-12 transition-colors ${
                i < currentIdx ? "bg-emerald-600" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}
