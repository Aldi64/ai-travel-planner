import Link from 'next/link';
import { Ticket, Wallet, Sparkles, MapPin } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-ink/15 px-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Ticket size={18} className="text-airmail" />
            <span className="font-headline font-semibold text-ink">
              AI Budget Travel Planner
            </span>
          </div>
          <Link href="/login" className="btn-secondary text-sm py-1.5 px-3">
            Sign in
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-3xl mx-auto px-4 pt-16 pb-12">
          <h1 className="text-4xl text-ink leading-tight">
            Plan a trip you can actually afford.
          </h1>
          <p className="text-ink/70 mt-4 max-w-xl">
            Set a budget by category, and let an AI pick a destination that
            genuinely fits -- checked against real flight and hotel pricing
            before it ever suggests a place, not just a rough guess.
          </p>
          <Link href="/login" className="btn-primary inline-block mt-6">
            Get started
          </Link>
        </section>

        <section className="max-w-3xl mx-auto px-4 pb-12">
          <div className="card-doc-elevated p-6">
            <h2 className="text-lg text-ink mb-4">How it works</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <Wallet size={20} className="text-gold mb-2" />
                <p className="text-ink font-medium text-sm">Set your budget</p>
                <p className="text-ink/60 text-sm mt-1">
                  Split by flights, stay, food, and activities.
                </p>
              </div>
              <div>
                <Sparkles size={20} className="text-gold mb-2" />
                <p className="text-ink font-medium text-sm">
                  AI picks a destination
                </p>
                <p className="text-ink/60 text-sm mt-1">
                  Checked against real flight and hotel prices first.
                </p>
              </div>
              <div>
                <MapPin size={20} className="text-gold mb-2" />
                <p className="text-ink font-medium text-sm">
                  Get a full itinerary
                </p>
                <p className="text-ink/60 text-sm mt-1">
                  Day by day, within what&apos;s left of your budget.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 pb-16">
          <div className="card-doc p-6">
            <h2 className="text-lg text-ink mb-2">
              Already know where you&apos;re going?
            </h2>
            <p className="text-ink/70 text-sm">
              Search any city in Explore for tourist areas, landmarks, nature
              spots, local food, and getting-around tips -- and save the ones
              you want to remember.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-ink/15 py-4">
        <div className="max-w-3xl mx-auto px-4 text-xs text-ink/50 data-text">
          AI BUDGET TRAVEL PLANNER // TRIP PLANNING SYSTEM
        </div>
      </footer>
    </div>
  );
}
