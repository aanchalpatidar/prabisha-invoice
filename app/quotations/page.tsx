"use client";

import Link from "next/link";

export default function QuotationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Quotations</h1>
      <p className="mb-4">This is the quotations list page. You can add, view, or manage quotations here.</p>
      <Link href="/quotations/create">
        <button className="px-4 py-2 bg-primary text-white rounded">Create New Quotation</button>
      </Link>
    </div>
  );
} 