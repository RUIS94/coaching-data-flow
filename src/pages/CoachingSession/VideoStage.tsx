import { useState } from "react";
import { Mic, MicOff, Video, VideoOff, MessageSquare, Users, Phone } from "lucide-react";
import salesLeaderImg from "@/assets/sam-avatar.svg";
import salesRepImg from "@/assets/sam-avatar.svg";

const participants = [
  { name: "James Mitchell", role: "Sales Leader", img: salesLeaderImg },
  { name: "Lisa Wang", role: "Account Executive", img: salesRepImg },
];

export default function VideoStage() {
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);

  return (
    <section className="flex-1 flex flex-col border-r border-border min-w-0">

      
      {/* Header */}
      <div className="h-14 border-b border-border flex items-center justify-between px-6">
        <div>
          <h1 className="text-[1.05rem] font-semibold tracking-tight text-foreground">
            Q3 Discovery Call: Acme Corp × CloudScale
          </h1>
        </div>
        <span className="text-xs font-medium text-muted-foreground font-mono tabular-nums">
          00:34:12
        </span>
      </div>

      {/* Video Area — main speaker full + PiP self-view */}
      <div className="flex-1 p-6 relative">
        {/* Main speaker — Sales Leader takes full area */}
        <div className="w-full h-full bg-secondary rounded-xl overflow-hidden relative">
          <img
            src={salesLeaderImg}
            alt="James Mitchell"
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-3 left-3 text-white text-xs bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
            James Mitchell · Sales Leader
          </span>
          <span className="absolute bottom-3 right-3">
            <Mic className="w-3.5 h-3.5 text-white drop-shadow" />
          </span>
        </div>

        {/* PiP self-view — bottom right */}
        <div className="absolute bottom-10 right-10 w-48 aspect-video bg-secondary rounded-lg border-2 border-background shadow-xl z-10 overflow-hidden">
          <img
            src={salesRepImg}
            alt="You"
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-2 left-2 text-white text-[11px] bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded">
            You
          </span>
        </div>
      </div>

      {/* Control Bar */}
      <div className="h-20 border-t border-border flex items-center justify-between px-8">
        <button className="text-destructive font-bold text-sm tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Phone className="w-4 h-4 rotate-[135deg]" />
          END MEETING
        </button>

        <div className="flex items-center gap-6">
          <button
            onClick={() => setMicOn(!micOn)}
            className={`p-2 rounded-lg transition-colors ${micOn ? "text-primary" : "text-muted-foreground"}`}
          >
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setVideoOn(!videoOn)}
            className={`p-2 rounded-lg transition-colors ${videoOn ? "text-primary" : "text-muted-foreground"}`}
          >
            {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>
          <button className="p-2 text-muted-foreground rounded-lg hover:text-primary transition-colors">
            <MessageSquare className="w-5 h-5" />
          </button>
          <button className="p-2 text-muted-foreground rounded-lg hover:text-primary transition-colors">
            <Users className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-destructive text-xs font-bold uppercase tracking-widest">
          <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
          Recording
        </div>
      </div>
    </section>
  );
}
