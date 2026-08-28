/**
 * Additive demo data — adds more applications (covering REJECTED / CLOSED and a
 * wider stage spread), plus internal notes and communications which the base
 * seed leaves empty. Idempotent: tagged with a marker note so re-runs skip.
 *
 *   bun run prisma/seed-extra.ts
 */
import { prisma } from "../src/prisma";
import { generateArn } from "../src/lib/lms";
import { calculateEmi } from "../src/types";
import type { Stage, AppStatus } from "@prisma/client";

const RAHUL = "jCJAewSsha0lNCNLHqxjOvD8yHzJOhpD";
const PRIYA = "DEb3nxSV4OCf891H0DIYiJgD21o0flAP";
const ADMIN = "aY3ovhrWHQs1StkLG6Yp70uZngIQrrm8";

const STAGE_SEQUENCE: Stage[] = [
  "APPLICATION_RECEIVED", "DOCUMENT_COLLECTION", "DOCUMENT_VERIFICATION", "CREDIT_CHECK",
  "SENT_TO_LENDER", "LENDER_REVIEW", "SANCTION_LETTER_ISSUED", "LEGAL_TECHNICAL_VERIFICATION",
  "AGREEMENT_SIGNING", "DISBURSEMENT_INITIATED", "DISBURSED", "CLOSED",
];

type Sample = {
  fullName: string; fatherName: string; mobile: string; pan: string; aadhaar: string;
  city: string; state: string; pincode: string; loanType: string; amount: number; tenure: number;
  cibil: number; worker: string; stage: Stage; status?: AppStatus; rate?: number;
  employmentType: any; employment: any; daysAgo: number; gender: any; purpose: string;
};

const samples: Sample[] = [
  {
    fullName: "Anjali Deshmukh", fatherName: "Prakash Deshmukh", mobile: "9823004567", pan: "EFGPD5678N",
    aadhaar: "678967896789", city: "Nagpur", state: "Maharashtra", pincode: "440001",
    loanType: "EDUCATION", amount: 1800000, tenure: 84, cibil: 745, worker: PRIYA,
    stage: "SENT_TO_LENDER", employmentType: "SALARIED", gender: "FEMALE",
    purpose: "MS abroad — tuition and living",
    employment: { companyName: "Accenture", designation: "Analyst", monthlySalary: 78000, salaryMode: "BANK_TRANSFER" },
    daysAgo: 9,
  },
  {
    fullName: "Ravi Teja", fatherName: "Subba Rao", mobile: "9966112233", pan: "GHIPT9012P",
    aadhaar: "789078907890", city: "Hyderabad", state: "Telangana", pincode: "500032",
    loanType: "LAP", amount: 8000000, tenure: 180, cibil: 778, worker: RAHUL,
    stage: "AGREEMENT_SIGNING", rate: 9.75, employmentType: "SELF_EMPLOYED_BUSINESS", gender: "MALE",
    purpose: "Business expansion against property",
    employment: { natureOfBusiness: "Pharma distribution", yearsInBusiness: 10, annualTurnover: 35000000, gstNumber: "36ABCDE5678G1Z2", udyamNumber: "UDYAM-TG-01-0005678" },
    daysAgo: 28,
  },
  {
    fullName: "Fatima Khan", fatherName: "Abdul Khan", mobile: "9700556677", pan: "IJKPF3456R",
    aadhaar: "890189018901", city: "Lucknow", state: "Uttar Pradesh", pincode: "226001",
    loanType: "TWO_WHEELER", amount: 120000, tenure: 24, cibil: 632, worker: PRIYA,
    stage: "CREDIT_CHECK", status: "REJECTED", employmentType: "SALARIED", gender: "FEMALE",
    purpose: "Two-wheeler purchase",
    employment: { companyName: "Local retail", designation: "Sales Exec", monthlySalary: 18000, salaryMode: "CASH" },
    daysAgo: 16,
  },
  {
    fullName: "Gurpreet Kaur", fatherName: "Manjit Singh", mobile: "9815998877", pan: "KLMPK7890T",
    aadhaar: "901290129012", city: "Ludhiana", state: "Punjab", pincode: "141001",
    loanType: "WORKING_CAPITAL", amount: 3500000, tenure: 36, cibil: 731, worker: RAHUL,
    stage: "LENDER_REVIEW", employmentType: "SELF_EMPLOYED_BUSINESS", gender: "FEMALE",
    purpose: "Inventory financing for textile unit",
    employment: { natureOfBusiness: "Textile manufacturing", yearsInBusiness: 6, annualTurnover: 18000000, gstNumber: "03ABCDE7890K1Z9" },
    daysAgo: 13,
  },
  {
    fullName: "Mohan Patel", fatherName: "Dinesh Patel", mobile: "9909223344", pan: "MNOPP1234V",
    aadhaar: "112211221122", city: "Ahmedabad", state: "Gujarat", pincode: "380015",
    loanType: "FOUR_WHEELER", amount: 950000, tenure: 60, cibil: 758, worker: PRIYA,
    stage: "CLOSED", status: "DISBURSED", rate: 8.9, employmentType: "SALARIED", gender: "MALE",
    purpose: "New car purchase",
    employment: { companyName: "Zydus", designation: "Manager", monthlySalary: 110000, salaryMode: "BANK_TRANSFER" },
    daysAgo: 95,
  },
  {
    fullName: "Deepak Yadav", fatherName: "Ram Yadav", mobile: "9876123450", pan: "OPQPY5678X",
    aadhaar: "223322332233", city: "Jaipur", state: "Rajasthan", pincode: "302001",
    loanType: "KISAN_CREDIT_CARD", amount: 400000, tenure: 12, cibil: 0, worker: RAHUL,
    stage: "DOCUMENT_COLLECTION", employmentType: "AGRICULTURIST", gender: "MALE",
    purpose: "Crop input financing",
    employment: { landAcres: 8, cropType: "Wheat & Mustard", kccNumber: "KCC-RJ-0099887" },
    daysAgo: 3,
  },
  {
    fullName: "Sneha Joshi", fatherName: "Anil Joshi", mobile: "9822667788", pan: "QRSPJ9012Z",
    aadhaar: "334433443344", city: "Indore", state: "Madhya Pradesh", pincode: "452001",
    loanType: "MUDRA_KISHOR", amount: 350000, tenure: 36, cibil: 701, worker: PRIYA,
    stage: "DISBURSEMENT_INITIATED", rate: 10.0, employmentType: "SELF_EMPLOYED_BUSINESS", gender: "FEMALE",
    purpose: "Beauty salon setup",
    employment: { natureOfBusiness: "Salon & spa", yearsInBusiness: 2, annualTurnover: 1500000, udyamNumber: "UDYAM-MP-23-0009012" },
    daysAgo: 19,
  },
];

async function main() {
  const marker = await prisma.internalNote.findFirst({ where: { body: { startsWith: "[seed-extra]" } } });
  if (marker) {
    console.log("✅ seed-extra already applied — skipping.");
    return;
  }

  console.log("📁 Adding extra sample applications…");
  for (const s of samples) {
    const arn = await generateArn();
    const createdAt = new Date(Date.now() - s.daysAgo * 86400000);
    const targetIdx = STAGE_SEQUENCE.indexOf(s.stage);
    const status: AppStatus = s.status
      ?? (s.stage === "DISBURSED" ? "DISBURSED"
        : ["SANCTION_LETTER_ISSUED", "LEGAL_TECHNICAL_VERIFICATION", "AGREEMENT_SIGNING", "DISBURSEMENT_INITIATED"].includes(s.stage) ? "APPROVED"
        : "IN_PROCESS");
    const sanctioned = s.rate ? s.amount : null;
    const emi = sanctioned && s.rate ? calculateEmi(sanctioned, s.rate, s.tenure) : null;

    const app = await prisma.application.create({
      data: {
        arn, createdAt,
        assignedWorkerId: s.worker,
        loanType: s.loanType, amount: s.amount, tenureMonths: s.tenure,
        purpose: s.purpose, cibilScore: s.cibil || null,
        stage: s.stage, status,
        fullName: s.fullName, fatherName: s.fatherName,
        dob: new Date("1990-03-21"), gender: s.gender, maritalStatus: "MARRIED",
        mobile: s.mobile, email: `${s.fullName.split(" ")[0].toLowerCase()}@example.com`,
        currentAddress: `45, Station Road, ${s.city}`, currentPincode: s.pincode,
        city: s.city, state: s.state, residentialStatus: "RENTED",
        pan: s.pan, aadhaar: s.aadhaar,
        employmentType: s.employmentType, employment: s.employment,
        sanctionedAmount: sanctioned, interestRate: s.rate ?? null,
        processingFee: sanctioned ? Math.round(sanctioned * 0.01) : null, emi,
        dpBankName: s.rate ? "ICICI Bank" : null,
        dpAccountNumber: s.rate ? "00112233445566" : null,
        dpIfsc: s.rate ? "ICIC0000112" : null,
        dpAccountHolder: s.rate ? s.fullName : null,
      },
    });

    const rejected = s.status === "REJECTED";
    const lastIdx = rejected ? STAGE_SEQUENCE.indexOf("CREDIT_CHECK") : targetIdx;
    for (let i = 0; i <= lastIdx; i++) {
      await prisma.stageHistory.create({
        data: {
          applicationId: app.id,
          fromStage: i === 0 ? null : STAGE_SEQUENCE[i - 1],
          toStage: STAGE_SEQUENCE[i],
          reason: i === 0 ? "Application submitted" : "Moved forward after review",
          changedById: s.worker,
          changedAt: new Date(createdAt.getTime() + i * 3600000 * 10),
        },
      });
    }

    await prisma.document.createMany({
      data: [
        { applicationId: app.id, docKey: "pan", label: "PAN Card", fileUrl: "https://example.com/pan.pdf", fileName: "pan.pdf", mimeType: "application/pdf", status: targetIdx >= 2 ? "VERIFIED" : "PENDING" },
        { applicationId: app.id, docKey: "aadhaar_front", label: "Aadhaar Card (Front)", fileUrl: "https://example.com/aadhaar.pdf", fileName: "aadhaar.pdf", mimeType: "application/pdf", status: targetIdx >= 2 ? "VERIFIED" : "PENDING" },
        { applicationId: app.id, docKey: "bank_statement", label: "Bank Statement (6 mo)", fileUrl: "https://example.com/bank.pdf", fileName: "bank.pdf", mimeType: "application/pdf", status: rejected ? "REJECTED" : targetIdx >= 3 ? "VERIFIED" : "PENDING", rejectionReason: rejected ? "Income insufficient for requested amount" : null },
      ],
    });

    await prisma.callLog.create({
      data: {
        applicationId: app.id, workerId: s.worker,
        outcome: rejected ? "CONNECTED" : "CALL_BACK_LATER", durationMins: rejected ? 6 : 2,
        notes: rejected ? "Informed applicant of decline; suggested re-apply with co-applicant." : "Requested pending documents; will call back tomorrow.",
        followUpAt: new Date(Date.now() + 2 * 86400000),
      },
    });

    // Internal notes
    await prisma.internalNote.create({
      data: {
        applicationId: app.id, authorId: s.worker,
        body: rejected
          ? "Profile does not meet FOIR norms. Declined as per credit policy."
          : `Followed up with applicant. ${s.cibil ? `CIBIL ${s.cibil}.` : "Bureau pull pending."} Looks ${s.cibil >= 750 ? "strong" : "manageable"}.`,
        tag: rejected ? "ESCALATED" : s.cibil && s.cibil < 700 ? "FOLLOW_UP" : "NONE",
      },
    });

    // Communications
    await prisma.communication.create({
      data: {
        applicationId: app.id, channel: "SMS", template: "APPLICATION_RECEIVED",
        body: `Dear ${s.fullName.split(" ")[0]}, your loan application ${arn} has been received. We will contact you shortly. — Lokansh`,
        status: "DELIVERED", sentById: s.worker,
        sentAt: new Date(createdAt.getTime() + 3600000),
      },
    });
    if (sanctioned) {
      await prisma.communication.create({
        data: {
          applicationId: app.id, channel: "EMAIL", template: "SANCTION_LETTER",
          subject: "Loan Sanctioned — " + arn,
          body: `Congratulations! Your loan of ₹${sanctioned.toLocaleString("en-IN")} has been sanctioned at ${s.rate}% p.a. EMI ₹${emi?.toLocaleString("en-IN")}.`,
          status: "SENT", sentById: s.worker,
          sentAt: new Date(createdAt.getTime() + 5 * 86400000),
        },
      });
    }

    if (s.stage === "DISBURSED" || s.stage === "CLOSED" || s.stage === "DISBURSEMENT_INITIATED") {
      if (sanctioned) {
        await prisma.disbursement.create({
          data: {
            applicationId: app.id, amount: sanctioned, mode: "RTGS", utr: "ICICN0098765432",
            disbursedAt: new Date(createdAt.getTime() + targetIdx * 3600000 * 10),
            note: "Full disbursement", createdById: s.worker,
          },
        });
      }
    }

    console.log(`  • ${arn} — ${s.fullName} (${s.stage}/${status})`);
  }

  // Add notes + comms to the original 5 files too, so every existing file has activity.
  const base = await prisma.application.findMany({
    select: { id: true, fullName: true, arn: true, assignedWorkerId: true, createdAt: true },
  });
  for (const a of base) {
    const has = await prisma.internalNote.count({ where: { applicationId: a.id } });
    if (has > 0) continue;
    const worker = a.assignedWorkerId ?? RAHUL;
    await prisma.internalNote.create({
      data: { applicationId: a.id, authorId: worker, body: "[seed-extra] Reviewed file; documentation in order, proceeding per SOP.", tag: "NONE" },
    });
    await prisma.communication.create({
      data: {
        applicationId: a.id, channel: "WHATSAPP", template: "STATUS_UPDATE",
        body: `Hi ${a.fullName.split(" ")[0]}, an update on your application ${a.arn} will reach you soon. — Lokansh`,
        status: "DELIVERED", sentById: worker, sentAt: new Date(a.createdAt.getTime() + 7200000),
      },
    });
  }

  // Guarantee marker exists for idempotency even if base loop matched nothing.
  const firstApp = await prisma.application.findFirst({ select: { id: true } });
  const hasMarker = await prisma.internalNote.findFirst({ where: { body: { startsWith: "[seed-extra]" } } });
  if (!hasMarker && firstApp) {
    await prisma.internalNote.create({
      data: { applicationId: firstApp.id, authorId: ADMIN, body: "[seed-extra] demo data applied.", tag: "NONE" },
    });
  }

  console.log("✅ Extra demo data added.");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
