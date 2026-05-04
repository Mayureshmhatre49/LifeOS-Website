'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Printer, Send, Check, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InvoiceItem { description: string; qty: number; rate: number; amount: number }
interface Invoice { id: string; invoice_no: string; client_id: string | null; project_id: string | null; issued_at: string; due_at: string | null; items: InvoiceItem[]; subtotal: number; tax_pct: number; tax_amt: number; discount_amt: number; total: number; currency: string; status: string; paid_at: string | null; notes: string | null; terms: string | null }
interface Client { name: string; company: string | null; email: string | null; phone: string | null; gst_no: string | null; pan_no: string | null; address: string | null }
interface Issuer { name: string | null; email: string }

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [project, setProject] = useState<{ name: string } | null>(null)
  const [issuer, setIssuer] = useState<Issuer | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  async function load() {
    const r = await fetch(`/api/business/invoice/${params.id}`).then(r => r.json())
    if (r.invoice) {
      setInvoice(r.invoice); setClient(r.client); setProject(r.project); setIssuer(r.issuer)
    }
  }
  useEffect(() => { load().finally(() => setLoading(false)) }, [params.id])

  async function setStatus(status: string) {
    if (!invoice) return
    setBusy(true)
    const patch: Record<string, unknown> = { status }
    if (status === 'paid') patch.paid_at = new Date().toISOString().slice(0, 10)
    await fetch('/api/business', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'invoice', id: invoice.id, ...patch }) })
    await load()
    setBusy(false)
  }

  async function remove() {
    if (!invoice || !confirm('Delete this invoice?')) return
    await fetch(`/api/business?kind=invoice&id=${invoice.id}`, { method: 'DELETE' })
    window.location.href = '/business'
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><div className="animate-spin h-5 w-5 rounded-full border-2 border-indigo-500 border-t-transparent" /></div>
  if (!invoice) return <div className="p-6"><Link href="/business" className="text-indigo-600 text-sm">← Back</Link><p className="mt-4 text-sm text-gray-500">Invoice not found.</p></div>

  return (
    <div className="min-h-full bg-gray-50">
      {/* Toolbar — hidden when printing */}
      <div className="print:hidden sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-3 flex items-center gap-2 max-w-3xl mx-auto">
        <Link href="/business" className="p-2 rounded-xl hover:bg-gray-100"><ArrowLeft className="h-4 w-4 text-gray-500" /></Link>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 truncate">{invoice.invoice_no}</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">{invoice.status}</p>
        </div>
        {invoice.status === 'draft' && <button disabled={busy} onClick={() => setStatus('sent')} className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5"><Send className="h-3 w-3" />Mark sent</button>}
        {invoice.status !== 'paid' && invoice.status !== 'cancelled' && <button disabled={busy} onClick={() => setStatus('paid')} className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5"><Check className="h-3 w-3" />Mark paid</button>}
        <button onClick={() => window.print()} className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold flex items-center gap-1.5"><Printer className="h-3 w-3" />Print / PDF</button>
        <button onClick={remove} className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
      </div>

      {/* Printable invoice */}
      <div className="max-w-3xl mx-auto p-6 md:p-10 print:p-0">
        <div className="bg-white rounded-3xl shadow-sm print:shadow-none print:rounded-none p-8 md:p-10 print:p-12 space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">INVOICE</h1>
              <p className="text-sm text-gray-500 mt-1">{invoice.invoice_no}</p>
            </div>
            <div className="text-right">
              <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full',
                invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                invoice.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                invoice.status === 'overdue' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-600',
              )}>{invoice.status}</span>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-2">Issued</p>
              <p className="text-sm font-bold text-gray-800">{invoice.issued_at}</p>
              {invoice.due_at && (
                <>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Due</p>
                  <p className="text-sm font-bold text-gray-800">{invoice.due_at}</p>
                </>
              )}
            </div>
          </div>

          {/* From / To */}
          <div className="grid grid-cols-2 gap-6 border-t border-b border-gray-100 py-6">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">From</p>
              <p className="text-sm font-bold text-gray-800">{issuer?.name ?? '—'}</p>
              <p className="text-xs text-gray-500">{issuer?.email}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Bill to</p>
              {client ? (
                <>
                  <p className="text-sm font-bold text-gray-800">{client.name}</p>
                  {client.company && <p className="text-xs text-gray-500">{client.company}</p>}
                  {client.email && <p className="text-xs text-gray-500">{client.email}</p>}
                  {client.phone && <p className="text-xs text-gray-500">{client.phone}</p>}
                  {client.address && <p className="text-xs text-gray-500 whitespace-pre-line">{client.address}</p>}
                  {client.gst_no && <p className="text-[10px] text-gray-400 mt-1">GSTIN: {client.gst_no}</p>}
                </>
              ) : <p className="text-xs text-gray-400 italic">No client linked</p>}
            </div>
          </div>

          {project && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Project</p>
              <p className="text-sm text-gray-700">{project.name}</p>
            </div>
          )}

          {/* Items table */}
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left py-2">Description</th>
                  <th className="text-right py-2 w-16">Qty</th>
                  <th className="text-right py-2 w-24">Rate</th>
                  <th className="text-right py-2 w-24">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((it, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-3 text-gray-800">{it.description}</td>
                    <td className="py-3 text-right text-gray-700">{it.qty}</td>
                    <td className="py-3 text-right text-gray-700">₹{it.rate.toLocaleString('en-IN')}</td>
                    <td className="py-3 text-right font-bold text-gray-800">₹{it.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-72 space-y-1.5">
              <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>₹{invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
              {invoice.discount_amt > 0 && <div className="flex justify-between text-sm text-gray-600"><span>Discount</span><span>-₹{invoice.discount_amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>}
              {invoice.tax_pct > 0 && <div className="flex justify-between text-sm text-gray-600"><span>Tax ({invoice.tax_pct}%)</span><span>₹{invoice.tax_amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>}
              <div className="flex justify-between text-base font-bold text-gray-900 border-t-2 border-gray-200 pt-2 mt-2">
                <span>Total</span>
                <span>₹{invoice.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              {invoice.paid_at && (
                <div className="flex justify-between text-xs text-emerald-700 mt-2 pt-2 border-t border-emerald-100">
                  <span className="font-bold">Paid</span><span>{invoice.paid_at}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notes / terms */}
          {(invoice.notes || invoice.terms) && (
            <div className="border-t border-gray-100 pt-6 space-y-3">
              {invoice.notes && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-xs text-gray-600 whitespace-pre-line">{invoice.notes}</p>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Terms</p>
                  <p className="text-xs text-gray-600 whitespace-pre-line">{invoice.terms}</p>
                </div>
              )}
            </div>
          )}

          <p className="text-center text-[10px] text-gray-300 pt-4">Generated with Life OS</p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body { background: white !important; }
        }
      `}</style>
    </div>
  )
}
