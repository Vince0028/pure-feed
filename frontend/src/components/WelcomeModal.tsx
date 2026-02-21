import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, BookOpen, Video, Info } from "lucide-react";

export function WelcomeModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Check if the user has seen the welcome modal before
        const hasSeenWelcome = localStorage.getItem("hasSeenWelcomeModal");
        if (!hasSeenWelcome) {
            setIsOpen(true);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem("hasSeenWelcomeModal", "true");
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="gap-2">
                    <div className="flex items-center gap-2 mb-2">
                        <img
                            src="/nofluff_logo.png"
                            alt="NoFluff.ai"
                            className="h-8 w-8 rounded-lg object-contain"
                        />
                        <span className="text-xl font-semibold tracking-tight">
                            <span className="text-gradient-primary">NoFluff</span>
                            <span className="text-muted-foreground font-normal">.ai</span>
                        </span>
                    </div>
                    <DialogTitle>Welcome to Pure Feed!</DialogTitle>
                    <DialogDescription>
                        Your AI-curated tech news and video feed, with absolutely zero fluff.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex items-start gap-3">
                        <div className="mt-1 bg-primary/10 p-2 rounded-full">
                            <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold mb-1">Articles & News</h4>
                            <p className="text-sm text-muted-foreground">
                                We pull the best discussions from Hacker News, Lobsters, Dev.to, and top tech RSS feeds.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="mt-1 bg-primary/10 p-2 rounded-full">
                            <Video className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold mb-1">Videos & Shorts</h4>
                            <p className="text-sm text-muted-foreground">
                                Tech-focused YouTube videos, YouTube Shorts, and TikToks.
                            </p>
                        </div>
                    </div>

                    <div className="mt-2 bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex gap-3 text-sm text-destructive items-start">
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        <p className="leading-relaxed">
                            <strong>Note on Videos:</strong> Some YouTube shorts or TikToks may
                            temporarily show as "unavailable" due to creator privacy settings
                            or regional blocks.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleClose} className="w-full">
                        Got it, Let's Go!
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
