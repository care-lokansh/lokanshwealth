import { Fragment, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalcField } from "./CalcField";
import { amortization, calcEmi, formatINR } from "./utils";
import { MIN_LOAN_AMOUNT } from "@/lib/lms";
import { useLoanApplication } from "@/components/landing/application/LoanApplicationContext";

export function EmiTool() {
  const { open } = useLoanApplication();
  const [amount, setAmount] = useState(1000000);
  const [rate, setRate] = useState(9.5);
  const [years, setYears] = useState(15);
  const [openYear, setOpenYear] = useState<number | null>(null);

  const monthName = (m: number) =>
    ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1];

  const months = years * 12;

  const { emi, total, interest, schedule } = useMemo(() => {
    const emiVal = calcEmi(amount, rate, months);
    const totalVal = emiVal * months;
    return {
      emi: emiVal,
      total: totalVal,
      interest: totalVal - amount,
      schedule: amortization(amount, rate, months),
    };
  }, [amount, rate, months]);

  const pieData = [
    { name: "Principal", value: amount },
    { name: "Interest", value: Math.max(0, interest) },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Inputs */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <div className="flex flex-col gap-8">
            <CalcField
              label="Loan amount"
              prefix="₹"
              value={amount}
              min={MIN_LOAN_AMOUNT}
              max={20000000}
              step={1000}
              onChange={setAmount}
              minLabel="₹1K"
              maxLabel="₹2Cr+"
              allowAboveMax
            />
            <CalcField
              label="Interest rate"
              suffix="%"
              value={rate}
              min={5}
              max={24}
              step={0.1}
              decimals={1}
              onChange={setRate}
              minLabel="5%"
              maxLabel="24%"
            />
            <CalcField
              label="Loan tenure"
              suffix="yr"
              value={years}
              min={1}
              max={30}
              step={1}
              onChange={setYears}
              minLabel="1 yr"
              maxLabel="30 yrs"
            />
          </div>
        </div>

        {/* Result */}
        <div className="flex flex-col justify-between rounded-3xl bg-primary p-6 text-primary-foreground sm:p-8">
          <div>
            <p className="text-sm font-semibold text-primary-foreground/70">
              Your monthly EMI
            </p>
            <p className="mt-1 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              {formatINR(emi)}
            </p>

            <div className="mx-auto mt-5 h-40 w-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={2}
                    stroke="none"
                    startAngle={90}
                    endAngle={-270}
                  >
                    <Cell fill="hsl(var(--primary-foreground))" />
                    <Cell fill="hsl(var(--accent))" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-5 space-y-3">
              <Legend
                color="bg-primary-foreground"
                label="Principal"
                value={formatINR(amount)}
              />
              <Legend
                color="bg-accent"
                label="Total interest"
                value={formatINR(interest)}
              />
              <div className="flex justify-between border-t border-primary-foreground/15 pt-3 text-sm">
                <span className="text-primary-foreground/70">Total payable</span>
                <span className="font-display text-lg font-semibold">
                  {formatINR(total)}
                </span>
              </div>
            </div>
          </div>

          <Button
            className="mt-7 rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => open()}
          >
            Apply for this loan
          </Button>
        </div>
      </div>

      {/* Amortization schedule */}
      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h3 className="font-display text-lg font-semibold text-foreground">
            Year-wise payment schedule
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            How your principal and interest are paid off over {years}{" "}
            {years === 1 ? "year" : "years"}. Tap a year to see it month by month.
          </p>
        </div>
        <div className="max-h-80 overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-secondary">
              <TableRow>
                <TableHead className="font-semibold">Year</TableHead>
                <TableHead className="text-right font-semibold">Principal</TableHead>
                <TableHead className="text-right font-semibold">Interest</TableHead>
                <TableHead className="text-right font-semibold">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedule.map((row) => {
                const isOpen = openYear === row.year;
                return (
                  <Fragment key={row.year}>
                    <TableRow
                      className="cursor-pointer transition-colors hover:bg-secondary/50"
                      onClick={() => setOpenYear(isOpen ? null : row.year)}
                    >
                      <TableCell className="font-semibold">
                        <span className="flex items-center gap-2">
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 text-muted-foreground transition-transform",
                              isOpen && "rotate-180",
                            )}
                          />
                          {row.year}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatINR(row.principalPaid)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatINR(row.interestPaid)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatINR(row.balance)}
                      </TableCell>
                    </TableRow>
                    {isOpen ? (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={4} className="bg-secondary/30 p-0">
                          <Table>
                            <TableHeader>
                              <TableRow className="hover:bg-transparent">
                                <TableHead className="h-9 pl-10 text-xs font-medium">Month</TableHead>
                                <TableHead className="h-9 text-right text-xs font-medium">Principal</TableHead>
                                <TableHead className="h-9 text-right text-xs font-medium">Interest</TableHead>
                                <TableHead className="h-9 text-right text-xs font-medium">Balance</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {row.months.map((mo) => (
                                <TableRow key={mo.month} className="hover:bg-transparent">
                                  <TableCell className="py-2 pl-10 text-sm text-muted-foreground">
                                    {monthName(mo.month)}
                                  </TableCell>
                                  <TableCell className="py-2 text-right text-sm">
                                    {formatINR(mo.principalPaid)}
                                  </TableCell>
                                  <TableCell className="py-2 text-right text-sm text-muted-foreground">
                                    {formatINR(mo.interestPaid)}
                                  </TableCell>
                                  <TableCell className="py-2 text-right text-sm font-medium">
                                    {formatINR(mo.balance)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function Legend({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-primary-foreground/70">
        <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
        {label}
      </span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
