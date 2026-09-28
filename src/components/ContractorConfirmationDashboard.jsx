import React, { useState } from "react";
import { useFlow } from "../lib/flow";
import { useAuth } from "../lib/auth";
import { toast } from "sonner";
import {
  Ship, CheckCircle2, XCircle, Clock, AlertTriangle,
  Building2, ArrowRight, ShieldCheck, Sparkles,
  Search, Filter, Send, MessageSquare, Wrench, RefreshCw,
  TrendingUp, Anchor, Check, X, FileText, ChevronRight
} from "lucide-react";

export default function ContractorConfirmationDashboard() {
  const { user } = useAuth();
  const {
    companyRequirements,
    updateContractorDecision,
    shipbuilderHulls,
    pingShipbuilderDesk,
    eventsList
  } = useFlow();

  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [selectedReq, setSelectedReq] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'ACCEPT' | 'REJECT' | 'WAIT' | 'DETAILS'

  // Accept Form state
  const [selectedVesselName, setSelectedVesselName] = useState("MV Bengal Voyager");
  const [acceptNote, setAcceptNote] = useState("Vessel confirmed from ballast fleet. Laycan window accepted.");

  // Reject Form state
  const [rejectReason, setRejectReason] = useState("Vessel class not available in requested laycan window (+7 days delay)");
  const [customReason, setCustomReason] = useState("");
  const [recommendedSolution, setRecommendedSolution] = useState("Recommend shifting laycan by +4 days to match incoming ballast vessel MV Bengal Titan.");
  const [customSolution, setCustomSolution] = useState("");
  const [rejectNote, setRejectNote] = useState("");

  // Wait Form state
  const [waitReason, setWaitReason] = useState("Checking with Cochin Shipyard & Fleet Dispatch for drydock hull survey clearance.");

  const requirements = companyRequirements || [];

  const pendingCount = requirements.filter(r => r.status === "PENDING_REVIEW").length;
  const acceptedCount = requirements.filter(r => r.status === "ACCEPTED").length;
  const rejectedCount = requirements.filter(r => r.status === "REJECTED_WITH_SOLUTION").length;
  const waitCount = requirements.filter(r => r.status === "WAIT_SHIPBUILDER").length;

  // 12 Major East Coast of India Port Draft Limits
  const EAST_COAST_DRAFT_LIMITS = {
    Paradip: 14.5,
    Visakhapatnam: 16.5,
    Haldia: 9.0,
    Krishnapatnam: 18.0,
    Chennai: 14.0,
    Dhamra: 18.0,
    Gangavaram: 18.5,
    "Ennore (Kamarajar)": 15.0,
    Kakinada: 12.5,
    "Tuticorin (V.O.C)": 14.0,
    Gopalpur: 13.5,
    "Kolkata (SMP)": 8.5
  };

  // AI Step 2: System predicts the best vessel hull for the contractor to allocate
  const predictBestVesselForReq = (req) => {
    const candidateHulls = (shipbuilderHulls && shipbuilderHulls.length > 0) ? shipbuilderHulls : [
      { name: "MV Berge Everest", category: "VLOC", dwt: "388,000 DWT", draftM: 21.5, location: "Deepwater Roads / Singapore", status: "READY_NOW", condition: "Valemax Class A1 (Deep Draft)", health: 97 },
      { name: "MV Tata Titan", category: "Capesize", dwt: "180,000 DWT", draftM: 18.2, location: "Bay of Bengal Deepwater", status: "READY_NOW", condition: "Heavy Bulk Class A1", health: 98 },
      { name: "MV Bengal Voyager", category: "Panamax", dwt: "74,000 DWT", draftM: 13.8, location: "Newcastle / Paradip", status: "READY_NOW", condition: "Survey Class A1", health: 95 },
      { name: "MV Jag Radha", category: "Panamax", dwt: "76,500 DWT", draftM: 14.1, location: "Singapore Ballast", status: "BALLAST_TRANSIT", condition: "ETA 3 Days (Hull Certified)", health: 97 },
      { name: "MV Coastal Pride", category: "Supramax", dwt: "58,000 DWT", draftM: 12.8, location: "Visakhapatnam Harbor", status: "READY_NOW", condition: "Cranes 4x30T Active", health: 92 },
      { name: "MV Vishva Nidhi", category: "Capesize", dwt: "180,000 DWT", draftM: 18.2, location: "Krishnapatnam Deepwater", status: "READY_NOW", condition: "Deep Berth Ready", health: 93 },
      { name: "MV Chennai Express", category: "Handysize", dwt: "35,000 DWT", draftM: 10.2, location: "Chennai Anchorage", status: "READY_NOW", condition: "Coastal Shallow Draft", health: 94 },
      { name: "MV Deccan Pioneer", category: "Panamax", dwt: "75,000 DWT", draftM: 13.9, location: "Krishnapatnam Roads", status: "READY_NOW", condition: "Optimal Engine", health: 96 },
      { name: "MV Coromandel Trader", category: "Panamax", dwt: "74,500 DWT", draftM: 13.8, location: "Ennore Harbor", status: "READY_NOW", condition: "At Berth Ready", health: 93 },
      { name: "MV Indus Navigator", category: "Supramax", dwt: "63,000 DWT", draftM: 13.2, location: "Bay of Bengal", status: "READY_NOW", condition: "Peak Health", health: 98 }
    ];

    const qty = Number(req?.cargoQuantity) || 70000;
    const destPort = req?.destinationPort || "Paradip";
    const portMaxDraft = EAST_COAST_DRAFT_LIMITS[destPort] || 14.5;
    const isVlocReq = qty >= 200000;
    const isCapeReq = qty >= 95000 && qty < 200000;

    const scored = candidateHulls.map(hull => {
      let score = 50;
      const numDwt = typeof hull.dwt === "number" ? hull.dwt : (parseInt(String(hull.dwt).replace(/[^0-9]/g, "")) || 74000);
      const draft = hull.draftM || (hull.category === "VLOC" ? 21.5 : hull.category === "Capesize" ? 18.2 : hull.category === "Panamax" ? 13.8 : hull.category === "Supramax" ? 12.8 : 10.0);

      // Volume-based category fitness
      if (isVlocReq) {
        if (hull.category === "VLOC") score += 55;
        else score -= 40;
      } else if (isCapeReq) {
        if (hull.category === "Capesize") score += 50;
        else score -= 35;
      } else {
        if (hull.category === "VLOC" || hull.category === "Capesize") score -= 45;
      }

      // 1. Draft compliance & transshipment compatibility
      const draftDiff = portMaxDraft - draft;
      if (draftDiff < 0) {
        if (isVlocReq && hull.category === "VLOC") {
          score += 10; // Offshore transshipment / lightering at deep outer roads
        } else if (isCapeReq && hull.category === "Capesize") {
          score += 15; // Lightering / deepwater berth operations
        } else {
          score -= 40; // Ineligible draft
        }
      } else {
        score += 20; // Safe direct draft
      }

      // 2. Capacity utilization
      const utilization = qty / numDwt;
      if (utilization >= 0.70 && utilization <= 1.05) {
        score += 35; // Ideal hold utilization
      } else if (utilization > 1.05) {
        score -= 45; // Cargo overflows ship deadweight
      } else if (utilization >= 0.40) {
        score += 15; // Acceptable utilization
      } else {
        score -= 20; // High deadfreight
      }

      // 3. Readiness status
      if (hull.status === "READY_NOW") score += 15;
      else if (hull.status === "BALLAST_TRANSIT") score += 10;

      // 4. Machinery Health Score
      score += ((hull.health || 95) - 90);

      const finalScore = Math.min(99, Math.max(35, Math.round(score)));

      return {
        ...hull,
        numDwt,
        draftM: draft,
        draftDiff: draftDiff.toFixed(1),
        isDraftSafe: draftDiff >= 0,
        utilizationPct: Math.round(utilization * 100),
        matchScore: finalScore
      };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);
    const best = scored[0];

    const rationale = isVlocReq
      ? `Top AI Recommendation (${best.matchScore}% Match): Very Large Ore Carrier (${best.name}, ${best.numDwt.toLocaleString()} DWT) allocated for ultra-heavy ${qty.toLocaleString()} MT parcel with ${best.utilizationPct}% hold efficiency. ${portMaxDraft < best.draftM ? `Handled via offshore transshipment / deepwater anchorage as port draft is ${portMaxDraft}m.` : `Direct fairway berthing at ${destPort} (${portMaxDraft}m draft).`}`
      : isCapeReq
      ? `Top AI Recommendation (${best.matchScore}% Match): Capesize Bulker (${best.name}, ${best.numDwt.toLocaleString()} DWT) allocated for ${qty.toLocaleString()} MT parcel with ${best.utilizationPct}% hold efficiency. ${portMaxDraft < best.draftM ? `Coordinated with deepwater outer anchorage / lightering at ${destPort} (${portMaxDraft}m draft limit).` : `Direct deepwater berth at ${destPort} (${portMaxDraft}m draft).`}`
      : `Top AI Recommendation (${best.matchScore}% Match): ${best.category} (${best.numDwt.toLocaleString()} DWT) fits ${qty.toLocaleString()} MT ${req?.cargoType || 'Cargo'} with ${best.utilizationPct}% hold efficiency. Laden draft of ${best.draftM}m safely clears ${destPort} port (${portMaxDraft}m max, +${best.draftDiff}m underkeel margin). Positioned at ${best.location}.`;

    return {
      bestVessel: best,
      rankedHulls: scored,
      rationale
    };
  };

  const filteredRequirements = requirements.filter(r => {
    if (filterStatus === "PENDING" && r.status !== "PENDING_REVIEW") return false;
    if (filterStatus === "ACCEPTED" && r.status !== "ACCEPTED") return false;
    if (filterStatus === "REJECTED" && r.status !== "REJECTED_WITH_SOLUTION") return false;
    if (filterStatus === "WAIT" && r.status !== "WAIT_SHIPBUILDER") return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        r.companyName.toLowerCase().includes(q) ||
        r.cargoType.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.destinationPort.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Handle Accept
  const handleConfirmAccept = () => {
    if (!selectedReq) return;
    if (!selectedReq?.cargoQuantity || Number(selectedReq.cargoQuantity) < 1000) {
      toast.error("Cannot confirm fixture: Requirement has invalid cargo quantity (minimum 1,000 MT required).");
      return;
    }
    try {
      const vesselObj = (shipbuilderHulls || []).find(v => v.name === selectedVesselName) || {
        name: selectedVesselName || "MV Bengal Voyager",
        category: selectedReq.preferredVesselCategory || "Panamax",
        dwt: 74000,
        draftM: 13.8,
        laycan: selectedReq.requiredArrivalDate || "Immediate"
      };

      if (updateContractorDecision) {
        updateContractorDecision(selectedReq.id, {
          status: "ACCEPTED",
          assignedVessel: vesselObj,
          contractorNote: acceptNote || "Charter confirmed by Tata NYK Fleet Ops."
        });
      }
      toast.success(`✅ Fixture Confirmed: Allocated ${vesselObj.name} for ${selectedReq.companyName}`);
    } catch (err) {
      console.error("Error confirming accept fixture:", err);
      toast.error("Error confirming fixture: " + err.message);
    } finally {
      setActiveModal(null);
      setSelectedReq(null);
    }
  };

  // Handle Reject with Solution
  const handleConfirmReject = () => {
    if (!selectedReq) return;
    const finalReason = rejectReason === "OTHER" ? customReason : rejectReason;
    const finalSolution = recommendedSolution === "OTHER" ? customSolution : recommendedSolution;

    if (!finalReason) {
      toast.error("Please provide a reason for declining.");
      return;
    }
    if (!finalSolution) {
      toast.error("Please provide a recommended solution or counter-proposal.");
      return;
    }

    try {
      if (updateContractorDecision) {
        updateContractorDecision(selectedReq.id, {
          status: "REJECTED_WITH_SOLUTION",
          rejectionReason: finalReason,
          recommendedSolution: finalSolution,
          contractorNote: rejectNote
        });
      }
      toast.success(`Counter-solution submitted to ${selectedReq.companyName}`);
    } catch (err) {
      console.error("Error submitting reject:", err);
    } finally {
      setActiveModal(null);
      setSelectedReq(null);
    }
  };

  // Handle Wait
  const handleConfirmWait = () => {
    if (!selectedReq) return;
    try {
      if (updateContractorDecision) {
        updateContractorDecision(selectedReq.id, {
          status: "WAIT_SHIPBUILDER",
          contractorNote: waitReason
        });
      }
      toast.info(`Hold status updated for ${selectedReq.companyName}`);
    } catch (err) {
      console.error("Error submitting wait:", err);
    } finally {
      setActiveModal(null);
      setSelectedReq(null);
    }
  };

  return (
    <div className="space-y-6" data-testid="contractor-dashboard">
      {/* 1. WORKSPACE HEADER */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-900 text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Ship size={12} />
              OCEAN CONTRACTOR WORKSPACE · TATA NYK SHIPPING
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE COMPANY TENDERS FEED
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5" style={{ fontFamily: "Manrope" }}>
            Company Shipping Requirements & Tenders Desk
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review incoming company requirements, verify shipbuilder & drydock availability, accept charters, or provide counter-solutions in real time.
          </p>
        </div>

        {/* Live Shipbuilder Ping Button */}
        <button
          onClick={pingShipbuilderDesk}
          className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-bold shadow flex items-center gap-2 transition-all cursor-pointer border border-slate-700"
        >
          <Wrench size={14} className="text-amber-400" />
          <span>Ping Shipbuilder Fleet Status</span>
        </button>
      </div>

      {/* 2. TOP 5 OPERATIONAL KPIS FOR CONTRACTOR */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs">
        <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/70 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-800 font-bold">
            <span>PENDING REVIEW</span>
            <AlertTriangle size={15} className="text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-950 mt-1">{pendingCount} Tenders</div>
          <div className="text-[10px] text-amber-700 mt-0.5">Awaiting contractor reaction</div>
        </div>

        <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/70 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-800 font-bold">
            <span>CONFIRMED FIXTURES</span>
            <CheckCircle2 size={15} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-950 mt-1">{acceptedCount} Active</div>
          <div className="text-[10px] text-emerald-700 mt-0.5">Vessels fixed & allocated</div>
        </div>

        <div className="p-3.5 rounded-xl border border-blue-300 bg-blue-50/70 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-800 font-bold">
            <span>SHIPBUILDER READY</span>
            <Wrench size={15} className="text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-950 mt-1">4 Hulls Open</div>
          <div className="text-[10px] text-blue-700 mt-0.5">1 undergoing drydock survey</div>
        </div>

        <div className="p-3.5 rounded-xl border border-purple-300 bg-purple-50/70 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-purple-800 font-bold">
            <span>COUNTER-SOLUTIONS</span>
            <MessageSquare size={15} className="text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-950 mt-1">{rejectedCount} Proposed</div>
          <div className="text-[10px] text-purple-700 mt-0.5">Alternative plans offered</div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-300 bg-slate-50 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-700 font-bold">
            <span>TOTAL VOLUME</span>
            <TrendingUp size={15} className="text-slate-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {requirements.reduce((acc, r) => acc + (Number(r.cargoQuantity) || 0), 0).toLocaleString()} MT
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Real company tender volume</div>
        </div>
      </div>

      {/* 3. SHIPBUILDER & FLEET AVAILABILITY DECK */}
      <div className="astra-card p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-md border border-slate-700 rounded-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 pb-2.5">
          <div className="flex items-center gap-2">
            <Anchor size={16} className="text-amber-400" />
            <div>
              <span className="font-extrabold text-sm text-white">Tata NYK Fleet & Shipbuilder Yard Readiness</span>
              <span className="text-slate-400 text-xs ml-2 font-mono hidden sm:inline">· Direct Yard Communication Feed</span>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500 font-bold">
            Cochin Shipyard & Ballast Positions: SYNCED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs font-mono">
          {(shipbuilderHulls || [
            { name: "MV Bengal Voyager", category: "Panamax", dwt: "74,000 DWT", location: "Newcastle / Paradip", status: "READY_NOW", condition: "Survey Class A1", color: "text-emerald-400" },
            { name: "MV Jag Radha", category: "Panamax", dwt: "76,500 DWT", location: "Singapore Ballast", status: "BALLAST_TRANSIT", condition: "ETA 3 Days (Hull Certified)", color: "text-blue-400" },
            { name: "MV Coastal Pride", category: "Supramax", dwt: "58,000 DWT", location: "Visakhapatnam Harbor", status: "READY_NOW", condition: "Cranes 4x30T Active", color: "text-emerald-400" },
            { name: "MV Vishva Nidhi", category: "Capesize", dwt: "180,000 DWT", location: "Cochin Shipyard Drydock", status: "DRYDOCK_CHECK", condition: "Release in 5 Days", color: "text-amber-400" },
            { name: "MV Chennai Express", category: "Handysize", dwt: "35,000 DWT", location: "Chennai Anchorage", status: "READY_NOW", condition: "Coastal Shallow Draft", color: "text-emerald-400" }
          ]).map((hull, idx) => (
            <div key={idx} className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <strong className="text-slate-100 font-bold">{hull.name}</strong>
                  <span className={`text-[9px] font-bold ${hull.color}`}>{hull.status.replace("_", " ")}</span>
                </div>
                <div className="text-slate-400 text-[11px] mt-0.5">{hull.category} · {hull.dwt}</div>
              </div>
              <div className="mt-2 pt-1.5 border-t border-white/10 text-[10px] text-slate-300">
                <div>📍 {hull.location}</div>
                <div className="text-amber-300/90 truncate">{hull.condition}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. CONFIRMATION LIST OF COMPANIES (REQUIREMENTS REVIEW & ACTION ENGINE) */}
      <div className="space-y-3.5">
        {/* Filter and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 font-mono text-xs">
            {[
              { key: "ALL", label: `All Tenders (${requirements.length})` },
              { key: "PENDING", label: `Pending Action (${pendingCount})`, badge: pendingCount > 0 },
              { key: "ACCEPTED", label: `Confirmed (${acceptedCount})` },
              { key: "REJECTED", label: `Counter-Offered (${rejectedCount})` },
              { key: "WAIT", label: `Shipbuilder Check (${waitCount})` }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${filterStatus === tab.key
                  ? "bg-blue-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
              >
                <span>{tab.label}</span>
                {tab.badge && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono w-full sm:w-64">
            <Search size={14} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search company, cargo, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent focus:outline-none w-full text-slate-800"
            />
          </div>
        </div>

        {/* Requirements Cards List */}
        <div className="space-y-3">
          {filteredRequirements.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 font-mono text-xs space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 text-blue-900 grid place-items-center">
                <Ship size={26} />
              </div>
              <div className="font-extrabold text-sm text-slate-800">No Shipping Requirements Issued Yet</div>
              <div className="max-w-md mx-auto text-slate-500 leading-relaxed text-[11px]">
                This desk displays authentic requirements issued by corporate shippers (e.g. Jindal Steel, Tata Steel).
                Switch to the <strong className="text-slate-900">COMPANY</strong> workspace in the topbar to issue a shipment requirement in the New Shipment Wizard.
              </div>
            </div>
          ) : (
            filteredRequirements.map((req) => {
              const isPending = req.status === "PENDING_REVIEW";
              const isAccepted = req.status === "ACCEPTED";
              const isRejected = req.status === "REJECTED_WITH_SOLUTION";
              const isWait = req.status === "WAIT_SHIPBUILDER";

              return (
                <div
                  key={req.id}
                  className={`astra-card p-4 sm:p-5 transition-all border-l-4 rounded-xl shadow-sm ${isPending
                    ? "border-l-amber-500 bg-white hover:border-l-amber-600"
                    : isAccepted
                      ? "border-l-emerald-600 bg-white"
                      : isRejected
                        ? "border-l-purple-600 bg-white"
                        : "border-l-blue-600 bg-white"
                    }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Company & Cargo Essentials */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold border border-slate-300">
                          {req.id}
                        </span>
                        <strong className="text-sm text-slate-900 font-extrabold flex items-center gap-1.5" style={{ fontFamily: "Manrope" }}>
                          <Building2 size={15} className="text-blue-900 shrink-0" />
                          {req.companyName}
                        </strong>
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-200 text-slate-700 font-bold">
                          Credit: {req.creditRating || "AAA"}
                        </span>
                        <span className="text-slate-400 text-[11px]">· {req.createdAt || "Recent"}</span>

                        {req.isNewlyCreated && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                            🚨 NEW REQ FROM SHIPPER
                          </span>
                        )}
                      </div>

                      {/* Cargo, Route & Vessel Specs */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono pt-1">
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">CARGO SPECIFICATION</span>
                          <div className="font-extrabold text-slate-900 mt-0.5">
                            {req.cargoQuantity?.toLocaleString()} MT · {req.cargoType}
                          </div>
                          <div className="text-[11px] text-slate-500">Stowage: {req.stowageFactor || "44 cu ft/MT"}</div>
                        </div>

                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">CORRIDOR & NODES</span>
                          <div className="font-extrabold text-blue-900 mt-0.5 flex items-center gap-1">
                            <span>{req.originPort}</span>
                            <ArrowRight size={12} />
                            <span>{req.destinationPort}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 truncate" title={req.destinationWarehouse}>
                            Plant: {req.destinationWarehouse}
                          </div>
                        </div>

                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">TARGET LAYCAN & BUDGET</span>
                          <div className="font-extrabold text-emerald-800 mt-0.5">
                            Arrival: {req.requiredArrivalDate}
                          </div>
                          <div className="text-[11px] text-slate-600">
                            Budget: <strong>${req.targetFreightRatePerTon || "16.90"}/MT</strong> Landed
                          </div>
                        </div>
                      </div>

                      {/* Preferred Vessel Specs */}
                      <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-slate-500 pt-1">
                        <span>Class: <strong className="text-slate-700">{req.preferredVesselCategory}</strong></span>
                        <span>· Port Draft Limit: <strong className="text-slate-700">{EAST_COAST_DRAFT_LIMITS[req.destinationPort] || req.maxDraftM || "14.5"}m</strong></span>
                        <span>· Contact: <strong className="text-slate-700">{req.contactPerson || "Commercial Desk"}</strong></span>
                      </div>

                      {/* AI Step 2: System Predicted Best Vessel for this Requirement */}
                      {isPending && (() => {
                        const prediction = predictBestVesselForReq(req);
                        return (
                          <div className="mt-2.5 p-3 rounded-xl bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-slate-50 border border-blue-200 shadow-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-mono font-bold text-blue-900 flex items-center gap-1.5">
                                <Sparkles size={13} className="text-amber-500 animate-pulse" />
                                ASTRA AI PREDICTED BEST VESSEL (STEP 2 ALLOCATION)
                              </span>
                              <span className="text-[10px] font-mono font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                                {prediction.bestVessel.matchScore}% MATCH SCORE
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <div className="text-xs font-mono font-extrabold text-slate-900 flex items-center gap-2">
                                  <span>{prediction.bestVessel.name}</span>
                                  <span className="text-[11px] font-normal text-slate-500 font-sans">
                                    ({prediction.bestVessel.category} · {prediction.bestVessel.numDwt.toLocaleString()} DWT · Draft {prediction.bestVessel.draftM}m)
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-600 font-sans mt-0.5 leading-snug">
                                  {prediction.rationale}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedReq(req);
                                  setSelectedVesselName(prediction.bestVessel.name);
                                  setAcceptNote(`Allocated AI-predicted ${prediction.bestVessel.name} (${prediction.bestVessel.category}) with ${prediction.bestVessel.matchScore}% payload & draft compatibility.`);
                                  setActiveModal("ACCEPT");
                                }}
                                className="shrink-0 px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-mono text-[11px] font-bold flex items-center gap-1.5 shadow cursor-pointer transition active:scale-95"
                              >
                                <Check size={13} />
                                <span>Allocate {prediction.bestVessel.name}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Right: Decision Status & Quick Action Buttons */}
                    <div className="flex flex-col sm:items-end justify-between gap-3 border-t lg:border-t-0 lg:border-l border-slate-100 pt-3 lg:pt-0 lg:pl-5 min-w-[280px]">
                      {/* Status Badge */}
                      <div>
                        {isPending && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-black font-mono bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                            <Clock size={13} className="text-amber-600 animate-spin" />
                            Awaiting Contractor Action
                          </span>
                        )}
                        {isAccepted && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-black font-mono bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5">
                            <CheckCircle2 size={13} className="text-emerald-600" />
                            CONFIRMED & FIXED
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-black font-mono bg-purple-100 text-purple-900 border border-purple-300 flex items-center gap-1.5">
                            <MessageSquare size={13} className="text-purple-600" />
                            COUNTER-SOLUTION PROVIDED
                          </span>
                        )}
                        {isWait && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-black font-mono bg-blue-100 text-blue-900 border border-blue-300 flex items-center gap-1.5">
                            <Wrench size={13} className="text-blue-600" />
                            CHECKING SHIPBUILDER / FLEET
                          </span>
                        )}
                      </div>

                      {/* Action Buttons for Contractor */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => {
                            const pred = predictBestVesselForReq(req);
                            setSelectedReq(req);
                            setSelectedVesselName(pred.bestVessel.name);
                            setAcceptNote(`Allocated AI-predicted ${pred.bestVessel.name} (${pred.bestVessel.category}) with ${pred.bestVessel.matchScore}% payload & draft compatibility.`);
                            setActiveModal("ACCEPT");
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-black flex items-center gap-1 shadow cursor-pointer transition-all"
                          title="Accept and allocate vessel"
                        >
                          <Check size={13} />
                          <span>Accept & Confirm</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedReq(req);
                            setActiveModal("REJECT");
                          }}
                          className="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-mono text-xs font-black flex items-center gap-1 shadow cursor-pointer transition-all"
                          title="Decline with specific reason and provide counter-solution"
                        >
                          <MessageSquare size={13} />
                          <span>Reject & Counter</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedReq(req);
                            setActiveModal("WAIT");
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-mono text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                          title="Put in wait while verifying with shipbuilder"
                        >
                          <Clock size={13} />
                          <span>Wait</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Operational Notes / Solutions Callout Box */}
                  {isAccepted && req.assignedVessel && (
                    <div className="mt-3 p-3 rounded-lg bg-emerald-50/80 border border-emerald-200 font-mono text-xs text-emerald-900 flex items-center justify-between gap-3">
                      <div>
                        <strong>Assigned Vessel:</strong> {req.assignedVessel.name} ({req.assignedVessel.category} · {req.assignedVessel.dwt?.toLocaleString()} DWT). {req.contractorNote}
                      </div>
                      <span className="text-[10px] text-emerald-700 font-bold shrink-0">Charter Fixture Active</span>
                    </div>
                  )}

                  {isRejected && (
                    <div className="mt-3 p-3 rounded-lg bg-purple-50/90 border border-purple-200 font-mono text-xs space-y-1.5">
                      <div className="flex items-start gap-2">
                        <span className="px-1.5 py-0.2 rounded bg-purple-200 text-purple-900 font-bold text-[10px] shrink-0">
                          REASON
                        </span>
                        <span className="text-purple-950 font-semibold">{req.rejectionReason}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-bold text-[10px] shrink-0">
                          RECOMMENDED SOLUTION
                        </span>
                        <span className="text-slate-800 font-bold">{req.recommendedSolution}</span>
                      </div>
                      {req.contractorNote && (
                        <div className="text-slate-500 text-[11px] pt-1">Contractor Note: {req.contractorNote}</div>
                      )}
                    </div>
                  )}

                  {isWait && (
                    <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200 font-mono text-xs text-blue-900 flex items-center justify-between gap-3">
                      <div>
                        <strong>Shipbuilder Inspection:</strong> {req.contractorNote || "Contacting Cochin Shipyard for hull inspection status."}
                      </div>
                      <span className="text-[10px] text-blue-700 font-bold shrink-0">ETA Decision &lt; 2h</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE CONTRACTOR DECISION MODALS */}
      {/* ========================================================================= */}

      {/* ACCEPT MODAL */}
      {activeModal === "ACCEPT" && selectedReq && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 font-mono text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900" style={{ fontFamily: "Manrope" }}>
                    Accept & Confirm Charter Fixture
                  </h3>
                  <p className="text-[11px] text-slate-500">{selectedReq.companyName} · {selectedReq.id}</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {/* Highlight the AI Predicted Best Vessel */}
              {(() => {
                const modalPred = predictBestVesselForReq(selectedReq);
                return (
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-blue-900 flex items-center gap-1">
                        <Sparkles size={12} className="text-amber-500" />
                        ASTRA AI PREDICTED BEST MATCH
                      </span>
                      <span className="font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300">
                        {modalPred.bestVessel.matchScore}% MATCH SCORE
                      </span>
                    </div>
                    <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                      <span>{modalPred.bestVessel.name}</span>
                      <span className="text-slate-500 font-normal">({modalPred.bestVessel.category} · {modalPred.bestVessel.numDwt.toLocaleString()} DWT)</span>
                    </div>
                    <div className="text-[10.5px] text-slate-600 font-sans leading-snug">
                      {modalPred.rationale}
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="text-slate-600 font-bold block mb-1">Select Vessel to Allocate for Fixture:</label>
                <select
                  value={selectedVesselName}
                  onChange={(e) => {
                    setSelectedVesselName(e.target.value);
                    const pred = predictBestVesselForReq(selectedReq);
                    const chosen = pred.rankedHulls.find(h => h.name === e.target.value);
                    if (chosen) {
                      setAcceptNote(`Allocated ${chosen.name} (${chosen.category}) for ${selectedReq.companyName}. Draft ${chosen.draftM}m verified for ${selectedReq.destinationPort}.`);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold text-slate-900 focus:outline-none"
                >
                  {predictBestVesselForReq(selectedReq).rankedHulls.map((h, idx) => (
                    <option key={h.name} value={h.name}>
                      {idx === 0 ? "⭐ [AI BEST FIT] " : ""}{h.name} ({h.category} · {h.numDwt.toLocaleString()} DWT · {h.matchScore}% Match · {h.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-600 font-bold block mb-1">Contractor Laycan Confirmation & Operational Note:</label>
                <textarea
                  rows={3}
                  value={acceptNote}
                  onChange={(e) => setAcceptNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none"
                  placeholder="Enter confirmation terms, arrival slot, and instructions..."
                />
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px]">
                ⚡ <strong>Real-time Synchronized Action:</strong> Accepting this requirement will automatically notify {selectedReq.companyName}, update Vessel Health with chartered company details, and authorize the ocean logistics corridor.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAccept}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md cursor-pointer flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Check size={15} />
                <span>Confirm & Authorize Fixture</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT & COUNTER-SOLUTION MODAL */}
      {activeModal === "REJECT" && selectedReq && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 font-mono text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 grid place-items-center">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900" style={{ fontFamily: "Manrope" }}>
                    Decline Tender & Provide Strategic Solution
                  </h3>
                  <p className="text-[11px] text-slate-500">{selectedReq.companyName} · {selectedReq.id}</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {/* Reason Selection */}
              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  1. Reason for Rejection / Challenge:
                </label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-900 focus:outline-none"
                >
                  <option value="Vessel class not available in requested laycan window (+7 days delay)">
                    Vessel class not available in requested laycan window (+7 days delay)
                  </option>
                  <option value="Tidal draft (14.2m) exceeds Paradip spring limit (Max 13.8m)">
                    Tidal draft (14.2m) exceeds Paradip spring limit (Max 13.8m)
                  </option>
                  <option value="Cargo volume (90,000 MT) exceeds single Supramax capacity">
                    Cargo volume (90,000 MT) exceeds single Supramax capacity
                  </option>
                  <option value="Target freight rate below operating bunker breakeven ($18.50/MT required)">
                    Target freight rate below operating bunker breakeven ($18.50/MT required)
                  </option>
                  <option value="Terminal berth congestion buffer exceeds SLA threshold at destination port">
                    Terminal berth congestion buffer exceeds SLA threshold at destination port
                  </option>
                  <option value="OTHER">Other Custom Reason...</option>
                </select>

                {rejectReason === "OTHER" && (
                  <input
                    type="text"
                    placeholder="Specify exact operational or commercial reason..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 mt-1.5 focus:outline-none"
                  />
                )}
              </div>

              {/* Solution Counter-Proposal Selection */}
              <div>
                <label className="text-slate-700 font-bold block mb-1 text-purple-900">
                  2. Provide Recommended Solution / Counter-Proposal (Sent to Company):
                </label>
                <select
                  value={recommendedSolution}
                  onChange={(e) => setRecommendedSolution(e.target.value)}
                  className="w-full bg-purple-50/60 border border-purple-300 rounded-lg p-2 font-bold text-purple-950 focus:outline-none"
                >
                  <option value="Recommend shifting laycan by +4 days to match incoming ballast vessel MV Bengal Titan.">
                    Recommend shifting laycan by +4 days to match incoming ballast vessel MV Bengal Titan
                  </option>
                  <option value="Recommend splitting cargo into 2x 45,000 MT Supramax shipments for rapid berth turnaround.">
                    Recommend splitting cargo into 2x 45,000 MT Supramax shipments for rapid berth turnaround
                  </option>
                  <option value="Recommend diverting discharge to Krishnapatnam Port for 18.5m deepwater draft clearance.">
                    Recommend diverting discharge to Krishnapatnam Port for 18.5m deepwater draft clearance
                  </option>
                  <option value="Adjust target freight rate to $17.80/MT to account for low-sulfur ECA bunker surcharge.">
                    Adjust target freight rate to $17.80/MT to account for low-sulfur ECA bunker surcharge
                  </option>
                  <option value="OTHER">Other Custom Solution Recommendation...</option>
                </select>

                {recommendedSolution === "OTHER" && (
                  <input
                    type="text"
                    placeholder="Enter your actionable counter-solution for the shipper..."
                    value={customSolution}
                    onChange={(e) => setCustomSolution(e.target.value)}
                    className="w-full bg-white border border-purple-300 rounded-lg p-2 text-slate-900 mt-1.5 focus:outline-none"
                  />
                )}
              </div>

              {/* Additional Comments */}
              <div>
                <label className="text-slate-600 font-bold block mb-1">3. Additional Contractor Remarks / Commercial Guidance:</label>
                <textarea
                  rows={2}
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                  placeholder="e.g., We have reserved the Newcastle berth slot until 17:00 HRS pending your decision..."
                />
              </div>

              <div className="p-3 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-[11px]">
                💬 <strong>Direct Shipper Notification:</strong> {selectedReq.companyName} will receive your reason and recommended counter-solution instantly with an option to apply your solution in 1 click!
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-lg bg-purple-700 text-white font-bold hover:bg-purple-800 shadow cursor-pointer flex items-center gap-1.5"
              >
                <Send size={13} />
                <span>Submit Counter-Solution</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WAIT (SHIPBUILDER CHECK) MODAL */}
      {activeModal === "WAIT" && selectedReq && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 font-mono text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 grid place-items-center">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900" style={{ fontFamily: "Manrope" }}>
                    Hold for Shipbuilder Hull Verification
                  </h3>
                  <p className="text-[11px] text-slate-500">{selectedReq.companyName} · {selectedReq.id}</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-slate-600 font-bold block mb-1">Status Note for Shipper:</label>
                <textarea
                  rows={3}
                  value={waitReason}
                  onChange={(e) => setWaitReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 text-[11px]">
                ℹ️ <strong>Status Notice:</strong> {selectedReq.companyName} will be informed that Tata NYK is contacting Cochin Shipyard & fleet dispatch. Decision expected within 2 hours.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmWait}
                className="px-4 py-2 rounded-lg bg-blue-900 text-white font-bold hover:bg-blue-800 shadow cursor-pointer flex items-center gap-1.5"
              >
                <Clock size={14} />
                <span>Set to Shipbuilder Hold</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
