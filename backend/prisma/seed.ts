/**
 * Seed: loan products, 1 Super Admin, 2 Workers, 1 demo Applicant, and 5
 * sample applications spread across pipeline stages. Idempotent — safe to re-run.
 *
 *   bun run seed
 */
import { prisma } from "../src/prisma";
import { auth } from "../src/auth";
import { PRODUCT_CATALOGUE } from "../src/lib/catalogue";
import { generateArn } from "../src/lib/lms";
import { calculateEmi } from "../src/types";
import type { Role, Stage } from "@prisma/client";

async function ensureUser(opts: {
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  officePhone?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: opts.email } });
  if (!existing) {
    await auth.api.signUpEmail({
      body: { email: opts.email, password: opts.password, name: opts.name },
    });
  }
  return prisma.user.update({
    where: { email: opts.email },
    data: {
      role: opts.role,
      phone: opts.phone,
      officePhone: opts.officePhone,
      emailVerified: true,
      active: true,
    },
  });
}

async function main() {
  console.log("🌱 Seeding loan products…");
  for (const p of PRODUCT_CATALOGUE) {
    await prisma.loanProduct.upsert({
      where: { code: p.code },
      create: { ...p, docChecklist: p.docChecklist as any },
      update: {
        name: p.name,
        category: p.category,
        minAmount: p.minAmount,
        maxAmount: p.maxAmount,
        processingFeePct: p.processingFeePct,
        interestMin: p.interestMin,
        interestMax: p.interestMax,
        typicalProcessDays: p.typicalProcessDays,
        docChecklist: p.docChecklist as any,
        sortOrder: p.sortOrder,
      },
    });
  }

  console.log("👤 Seeding accounts…");
  const admin = await ensureUser({
    name: "Anand Mehta",
    email: "admin@lokansh.in",
    password: "Admin@12345",
    role: "SUPER_ADMIN",
    phone: "9810000001",
    officePhone: "011-4000-1000",
  });
  const rahul = await ensureUser({
    name: "Rahul Verma",
    email: "rahul@lokansh.in",
    password: "Worker@12345",
    role: "WORKER",
    phone: "9810000002",
    officePhone: "011-4000-1010",
  });
  const priya = await ensureUser({
    name: "Priya Nair",
    email: "priya@lokansh.in",
    password: "Worker@12345",
    role: "WORKER",
    phone: "9810000003",
    officePhone: "011-4000-1020",
  });
  const applicant = await ensureUser({
    name: "Suresh Kumar",
    email: "applicant@lokansh.in",
    password: "Apply@12345",
    role: "APPLICANT",
    phone: "9876500000",
  });

  // Avoid duplicating sample files on re-run.
  const already = await prisma.application.count();
  if (already > 0) {
    console.log(`✅ ${already} applications already present — skipping sample files.`);
    console.log("Done.");
    return;
  }

  console.log("📁 Seeding sample applications…");
  const STATES = ["Maharashtra", "Karnataka", "Delhi", "Uttar Pradesh", "Tamil Nadu"];

  type Sample = {
    fullName: string; fatherName: string; mobile: string; pan: string; aadhaar: string;
    city: string; state: string; loanType: string; amount: number; tenure: number;
    cibil: number; worker: string; applicantId?: string; stage: Stage; rate?: number;
    employmentType: any; employment: any; daysAgo: number;
  };

  const samples: Sample[] = [
    {
      fullName: "Suresh Kumar", fatherName: "Ramesh Kumar", mobile: "9876500000", pan: "ABCPK1234F",
      aadhaar: "123412341234", city: "Mumbai", state: "Maharashtra", loanType: "SALARIED_PERSONAL",
      amount: 800000, tenure: 48, cibil: 762, worker: rahul.id, applicantId: applicant.id,
      stage: "DOCUMENT_VERIFICATION", employmentType: "SALARIED",
      employment: { companyName: "Infosys Ltd", designation: "Senior Engineer", monthlySalary: 95000, salaryMode: "BANK_TRANSFER", hrContact: "022-66000000" },
      daysAgo: 6,
    },
    {
      fullName: "Meena Iyer", fatherName: "Krishnan Iyer", mobile: "9845012345", pan: "AXKPI8765L",
      aadhaar: "234523452345", city: "Bengaluru", state: "Karnataka", loanType: "HOME",
      amount: 4500000, tenure: 240, cibil: 805, worker: priya.id,
      stage: "SANCTION_LETTER_ISSUED", rate: 8.75, employmentType: "SALARIED",
      employment: { companyName: "Wipro", designation: "Project Manager", monthlySalary: 180000, salaryMode: "BANK_TRANSFER" },
      daysAgo: 22,
    },
    {
      fullName: "Imran Shaikh", fatherName: "Yusuf Shaikh", mobile: "9920011223", pan: "BNZPS4567Q",
      aadhaar: "345634563456", city: "Pune", state: "Maharashtra", loanType: "BUSINESS",
      amount: 2500000, tenure: 60, cibil: 718, worker: rahul.id,
      stage: "CREDIT_CHECK", employmentType: "SELF_EMPLOYED_BUSINESS",
      employment: { natureOfBusiness: "Auto components trading", yearsInBusiness: 7, annualTurnover: 12000000, gstNumber: "27ABCDE1234F1Z5", udyamNumber: "UDYAM-MH-12-0001234" },
      daysAgo: 11,
    },
    {
      fullName: "Lakshmi Reddy", fatherName: "Venkat Reddy", mobile: "9701122334", pan: "CPQPR3456M",
      aadhaar: "456745674567", city: "Chennai", state: "Tamil Nadu", loanType: "FOUR_WHEELER",
      amount: 1200000, tenure: 60, cibil: 689, worker: priya.id,
      stage: "DISBURSED", rate: 9.5, employmentType: "SALARIED",
      employment: { companyName: "TCS", designation: "Consultant", monthlySalary: 120000, salaryMode: "BANK_TRANSFER" },
      daysAgo: 34,
    },
    {
      fullName: "Harpreet Singh", fatherName: "Gurdeep Singh", mobile: "9811223344", pan: "DRSPS9012K",
      aadhaar: "567856785678", city: "New Delhi", state: "Delhi", loanType: "GOLD",
      amount: 300000, tenure: 12, cibil: 0, worker: rahul.id,
      stage: "APPLICATION_RECEIVED", employmentType: "SELF_EMPLOYED_PROFESSIONAL",
      employment: { natureOfBusiness: "Jewellery retail", yearsInBusiness: 12, annualTurnover: 8000000 },
      daysAgo: 1,
    },
  ];

  const STAGE_SEQUENCE: Stage[] = [
    "APPLICATION_RECEIVED", "DOCUMENT_COLLECTION", "DOCUMENT_VERIFICATION", "CREDIT_CHECK",
    "SENT_TO_LENDER", "LENDER_REVIEW", "SANCTION_LETTER_ISSUED", "LEGAL_TECHNICAL_VERIFICATION",
    "AGREEMENT_SIGNING", "DISBURSEMENT_INITIATED", "DISBURSED", "CLOSED",
  ];

  for (const s of samples) {
    const arn = await generateArn();
    const createdAt = new Date(Date.now() - s.daysAgo * 86400000);
    const targetIdx = STAGE_SEQUENCE.indexOf(s.stage);
    const status =
      s.stage === "DISBURSED" ? "DISBURSED"
        : ["SANCTION_LETTER_ISSUED", "LEGAL_TECHNICAL_VERIFICATION", "AGREEMENT_SIGNING", "DISBURSEMENT_INITIATED"].includes(s.stage) ? "APPROVED"
        : "IN_PROCESS";
    const sanctioned = s.rate ? s.amount : null;
    const emi = sanctioned && s.rate ? calculateEmi(sanctioned, s.rate, s.tenure) : null;

    const app = await prisma.application.create({
      data: {
        arn,
        createdAt,
        applicantId: s.applicantId ?? null,
        assignedWorkerId: s.worker,
        loanType: s.loanType,
        amount: s.amount,
        tenureMonths: s.tenure,
        purpose: "As declared in application",
        cibilScore: s.cibil || null,
        stage: s.stage,
        status: status as any,
        fullName: s.fullName,
        fatherName: s.fatherName,
        dob: new Date("1988-05-14"),
        gender: "MALE",
        maritalStatus: "MARRIED",
        mobile: s.mobile,
        email: `${s.fullName.split(" ")[0].toLowerCase()}@example.com`,
        currentAddress: `12, MG Road, ${s.city}`,
        currentPincode: "400001",
        city: s.city,
        state: s.state,
        residentialStatus: "OWNED",
        pan: s.pan,
        aadhaar: s.aadhaar,
        employmentType: s.employmentType,
        employment: s.employment,
        sanctionedAmount: sanctioned,
        interestRate: s.rate ?? null,
        processingFee: sanctioned ? Math.round(sanctioned * 0.01) : null,
        emi,
        dpBankName: s.rate ? "HDFC Bank" : null,
        dpAccountNumber: s.rate ? "50100123456789" : null,
        dpIfsc: s.rate ? "HDFC0001234" : null,
        dpAccountHolder: s.rate ? s.fullName : null,
      },
    });

    // Stage history up to the current stage.
    for (let i = 0; i <= targetIdx; i++) {
      await prisma.stageHistory.create({
        data: {
          applicationId: app.id,
          fromStage: i === 0 ? null : STAGE_SEQUENCE[i - 1],
          toStage: STAGE_SEQUENCE[i],
          reason: i === 0 ? "Application submitted" : "Moved forward after review",
          changedById: s.worker,
          changedAt: new Date(createdAt.getTime() + i * 3600000 * 12),
        },
      });
    }

    // A couple of documents + one call.
    await prisma.document.createMany({
      data: [
        { applicationId: app.id, docKey: "pan", label: "PAN Card", fileUrl: "https://example.com/pan.pdf", fileName: "pan.pdf", mimeType: "application/pdf", status: targetIdx >= 2 ? "VERIFIED" : "PENDING" },
        { applicationId: app.id, docKey: "aadhaar_front", label: "Aadhaar Card (Front)", fileUrl: "https://example.com/aadhaar.pdf", fileName: "aadhaar.pdf", mimeType: "application/pdf", status: targetIdx >= 2 ? "VERIFIED" : "PENDING" },
      ],
    });
    await prisma.callLog.create({
      data: {
        applicationId: app.id, workerId: s.worker, outcome: "CONNECTED", durationMins: 4,
        notes: "Applicant confirmed documents will be shared by EOD.",
        followUpAt: new Date(Date.now() + 86400000),
      },
    });

    // Disbursement tranche for the disbursed file.
    if (s.stage === "DISBURSED" && sanctioned) {
      await prisma.disbursement.create({
        data: {
          applicationId: app.id, amount: sanctioned, mode: "NEFT", utr: "HDFCN0012345678",
          disbursedAt: new Date(createdAt.getTime() + targetIdx * 3600000 * 12), note: "Full disbursement",
          createdById: s.worker,
        },
      });
    }

    console.log(`  • ${arn} — ${s.fullName} (${s.stage})`);
  }

  console.log("✅ Seed complete.");
  console.log("\nDemo logins:");
  console.log("  Super Admin : admin@lokansh.in / Admin@12345");
  console.log("  Worker 1    : rahul@lokansh.in / Worker@12345");
  console.log("  Worker 2    : priya@lokansh.in / Worker@12345");
  console.log("  Applicant   : applicant@lokansh.in / Apply@12345");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
