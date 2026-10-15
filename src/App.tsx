import React, { useState } from 'react';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  Box,
  Boxes,
  Check,
  ChevronRight,
  CircleDot,
  FileVideo,
  Layers3,
  LayoutDashboard,
  Orbit,
  ShieldCheck,
  Sparkles,
  Waves
} from 'lucide-react';

type Workspace = 'overview' | 'atlas' | 'echo' | 'library';

const WORKSPACES: Array<{ id: Workspace; label: string; subtitle: string; icon: React.ReactNode }> = [
  { id: 'overview', label: 'Overview', subtitle: 'Foundation', icon: <LayoutDashboard size={17} /> },
  { id: 'atlas', label: '3D Atlas', subtitle: 'Spatial anatomy', icon: <Orbit size={17} /> },
  { id: 'echo', label: 'Echo Lab', subtitle: 'Ultrasound studies', icon: <Waves size={17} /> },
  { id: 'library', label: 'Asset library', subtitle: 'Source material', icon: <Layers3 size={17} /> }
];

function QuietPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.11em] text-slate-500">
      {children}
    </span>
  );
}

function Metric({ number, label, detail }: { number: string; label: string; detail: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 md:p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">{label}</span>
        <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{number}</div>
      <div className="mt-1 text-xs leading-relaxed text-slate-500">{detail}</div>
    </div>
  );
}

function EmptyWorkspace({ mode, onBack }: { mode: 'atlas' | 'echo' | 'library'; onBack: () => void }) {
  const info = {
    atlas: {
      index: 'WORKSPACE 01',
      title: 'A clean 3D scene.',
      copy: 'The previous procedural anatomy has been removed. This viewport will stay empty until a validated, licensed anatomical model is integrated and checked for proportions, orientation, mesh quality, and labels.',
      icon: <Box size={24} strokeWidth={1.5} />,
      tags: ['GLB / glTF', 'Real source mesh', 'Named structures']
    },
    echo: {
      index: 'WORKSPACE 02',
      title: 'A real echo study, not a simulation.',
      copy: 'The previous synthetic echo view has been removed. This workspace will be built around actual ultrasound loops, appropriate study metadata, and a purpose-built viewer—not generated shapes pretending to be sonography.',
      icon: <AudioLines size={24} strokeWidth={1.5} />,
      tags: ['Cine loops', 'Study metadata', 'Frame navigation']
    },
    library: {
      index: 'SOURCE MATERIAL',
      title: 'No assets connected yet.',
      copy: 'Only assets with traceable sources, usable licenses, stable versions, and reviewable quality checks will enter the new library. Nothing is loaded into the viewer by default.',
      icon: <Layers3 size={24} strokeWidth={1.5} />,
      tags: ['Provenance', 'License review', 'Quality checks']
    }
  }[mode];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 bg-white/75 px-5 py-4 md:px-8">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-700">{info.index}</div>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">{info.title}</h1>
        </div>
        <QuietPill><span className="h-1.5 w-1.5 rounded-full bg-slate-300" /> Empty by design</QuietPill>
      </div>

      <div className="relative flex min-h-[300px] flex-1 items-center justify-center overflow-hidden p-5 md:p-10">
        <div aria-hidden="true" className="absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(to right, #e9edf2 1px, transparent 1px), linear-gradient(to bottom, #e9edf2 1px, transparent 1px)', backgroundSize: '32px 32px', maskImage: 'radial-gradient(ellipse at center, black 10%, transparent 76%)' }} />
        <div className="relative z-10 w-full max-w-xl rounded-[28px] border border-white bg-white/95 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:p-9">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-teal-100 bg-teal-50 text-teal-800">{info.icon}</div>
          <div className="mt-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Fresh foundation</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{info.title}</h2>
          <p className="mt-3 max-w-lg text-sm leading-7 text-slate-600">{info.copy}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {info.tags.map(tag => <span key={tag} className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 ring-1 ring-inset ring-slate-200">{tag}</span>)}
          </div>
          <button onClick={onBack} className="mt-8 inline-flex items-center gap-2 text-xs font-semibold text-teal-800 transition hover:gap-3">
            Return to project overview <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [workspace, setWorkspace] = useState<Workspace>('overview');

  return (
    <div className="flex h-[100dvh] min-h-[560px] w-full overflow-hidden bg-[#f4f6f8] text-slate-900">
      <aside className="z-20 flex w-[68px] shrink-0 flex-col items-center border-r border-slate-200 bg-white py-4 md:w-[228px] md:items-stretch md:px-3">
        <button onClick={() => setWorkspace('overview')} className="mb-9 flex items-center justify-center gap-2.5 px-1 md:justify-start md:px-2" aria-label="Medalicus home">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#113f42] text-white shadow-sm"><Activity size={20} strokeWidth={1.8} /></span>
          <span className="hidden min-w-0 text-left md:block">
            <span className="block text-sm font-bold tracking-[0.14em] text-slate-900">MEDALICUS</span>
            <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">Clinical learning studio</span>
          </span>
        </button>

        <div className="hidden px-3 pb-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400 md:block">Workspace</div>
        <nav className="flex flex-col gap-1.5">
          {WORKSPACES.map(item => {
            const selected = workspace === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setWorkspace(item.id)}
                title={item.label}
                className={`group flex min-h-11 items-center justify-center gap-3 rounded-xl px-2.5 text-left transition md:justify-start ${selected ? 'bg-[#eaf4f2] text-[#175f59]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
              >
                <span className={selected ? 'text-[#175f59]' : 'text-slate-400 group-hover:text-slate-700'}>{item.icon}</span>
                <span className="hidden min-w-0 flex-1 md:block">
                  <span className="block text-xs font-semibold">{item.label}</span>
                  <span className={`mt-0.5 block text-[10px] ${selected ? 'text-[#4b807b]' : 'text-slate-400'}`}>{item.subtitle}</span>
                </span>
                {selected && <span className="hidden h-1.5 w-1.5 rounded-full bg-[#287c73] md:block" />}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto hidden rounded-2xl border border-slate-200 bg-slate-50 p-3 md:block">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500"><ShieldCheck size={14} className="text-teal-700" /> Quality first</div>
          <p className="mt-2 text-[11px] leading-5 text-slate-500">No anatomy or echo is shown until the source material is verified.</p>
        </div>
        <div className="mt-auto flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-[10px] font-bold tracking-wider text-slate-500 md:hidden">00</div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-[58px] shrink-0 items-center justify-between border-b border-slate-200 bg-white/85 px-4 md:px-7">
          <div className="flex min-w-0 items-center gap-2 text-xs">
            <span className="hidden text-slate-400 sm:inline">Medalicus</span>
            <ChevronRight size={13} className="hidden text-slate-300 sm:block" />
            <span className="truncate font-semibold text-slate-700">{WORKSPACES.find(w => w.id === workspace)?.label}</span>
            <span className="ml-1 hidden rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-slate-500 sm:inline">BUILD 00</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-medium text-slate-500 sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Rebuild in progress</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500"><Sparkles size={15} /></span>
          </div>
        </header>

        {workspace === 'overview' ? (
          <div className="flex-1 overflow-y-auto">
            <section className="px-5 pb-7 pt-7 md:px-8 md:pb-9 md:pt-10">
              <div className="mx-auto max-w-6xl">
                <QuietPill><CircleDot size={11} /> Project reset · iteration 00</QuietPill>
                <div className="mt-5 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                  <div className="max-w-3xl">
                    <h1 className="text-3xl font-semibold leading-[1.13] tracking-[-0.04em] text-slate-950 md:text-5xl">Build the learning experience.<br className="hidden sm:block" /> Start with real source material.</h1>
                    <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">The old procedural anatomy and simulated echo views are gone. This is a clean foundation for a distinctive medical learning studio—where model fidelity comes before effects, and every visual has a traceable source.</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-800"><ShieldCheck size={20} /></div>
                    <div>
                      <div className="text-xs font-semibold text-slate-800">Source-first workflow</div>
                      <div className="mt-1 text-[10px] text-slate-500">No fabricated anatomy · No fake cine</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mx-auto max-w-6xl px-5 md:px-8">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Metric number="0" label="Anatomical models" detail="No 3D source assets connected" />
                <Metric number="0" label="Echo studies" detail="No ultrasound clips connected" />
                <Metric number="00" label="Build iteration" detail="Fresh implementation baseline" />
              </div>
            </section>

            <section className="mx-auto mt-8 max-w-6xl px-5 pb-12 md:px-8">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-800">Choose a workspace</div>
                  <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-slate-900 md:text-xl">Nothing is faked to fill the screen.</h2>
                </div>
                <span className="hidden items-center gap-1 text-[10px] font-medium text-slate-400 sm:flex">Clean slate <ArrowUpRight size={12} /></span>
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <button onClick={() => setWorkspace('atlas')} className="group rounded-[22px] border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-[0_16px_44px_rgba(15,23,42,0.06)] md:p-6">
                  <div className="flex items-start justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700"><Orbit size={22} strokeWidth={1.5} /></span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500">Not connected</span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-900">3D Anatomy Studio</h3>
                  <p className="mt-2 max-w-lg text-xs leading-6 text-slate-500">A real model, correct scale and orientation, inspectable structures, and purposeful lighting. No primitive-shape organs.</p>
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-[10px] font-medium text-slate-400">MODEL-DRIVEN VIEWER</span>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-teal-800">Open workspace <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span>
                  </div>
                </button>

                <button onClick={() => setWorkspace('echo')} className="group rounded-[22px] border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-[0_16px_44px_rgba(15,23,42,0.06)] md:p-6">
                  <div className="flex items-start justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700"><Waves size={22} strokeWidth={1.5} /></span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500">Not connected</span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-900">Echo Study Lab</h3>
                  <p className="mt-2 max-w-lg text-xs leading-6 text-slate-500">An actual echo-loop viewer with clip navigation, standard views, measurements, and learning annotations—built around genuine ultrasound data.</p>
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-[10px] font-medium text-slate-400">CINE-FIRST WORKFLOW</span>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-teal-800">Open workspace <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span>
                  </div>
                </button>
              </div>

              <div className="mt-5 rounded-[22px] border border-slate-200 bg-white p-5 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200"><Boxes size={18} /></div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Rebuild order</h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500">Quality gates before interaction polish.</p>
                    </div>
                  </div>
                  <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3 md:max-w-3xl">
                    {[
                      ['01', 'Select trusted models', 'Verify source, license, topology and orientation.'],
                      ['02', 'Build the 3D core', 'Scale, camera, lighting and picking.'],
                      ['03', 'Add echo as its own tool', 'Load real clips; build playback and annotations.']
                    ].map(([n, title, detail]) => (
                      <div key={n} className="rounded-xl bg-slate-50 p-3">
                        <div className="text-[10px] font-bold tracking-[0.14em] text-teal-800">{n}</div>
                        <div className="mt-2 text-xs font-semibold text-slate-800">{title}</div>
                        <div className="mt-1 text-[10px] leading-5 text-slate-500">{detail}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-5 text-[10px] leading-5 text-slate-400">This baseline intentionally contains no model meshes or simulated echo frames. Clinical use is not intended.</p>
            </section>
          </div>
        ) : (
          <EmptyWorkspace mode={workspace} onBack={() => setWorkspace('overview')} />
        )}
      </main>
    </div>
  );
}
