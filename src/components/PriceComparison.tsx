import { Navigation, } from 'decky-frontend-lib';
import { useEffect, useRef, useState } from 'react'
import { isThereAnyDealService, DealResult } from '../service/IsThereAnyDealService';
import { Game } from '../models/Game';
import { CACHE } from '../utils/Cache';
import { Deal } from '../models/Deal';
import { formatPrice } from '../utils/Currency';

const SAFE_ZONE_FROM_BOTTOM = 8;
const LEFT_SAFE_MARGIN = 150;
const BUTTON_HEIGHT = 25;
const BUTTON_WIDTH = 128;

const PriceComparison = () => {
    const [appId, setAppid] = useState<string | null>(null)
    const [game, setGame] = useState<Game | null>(null)
    const [deal, setDeal] = useState<Deal | null>(null)
    const [historicalLow, setHistoricalLow] = useState<number | null>(null)
    const [isVisible, setIsVisible] = useState(false)
    const [loading, setLoading] = useState(false)
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [measuredHeight, setMeasuredHeight] = useState(BUTTON_HEIGHT);

    useEffect(() => {
        function loadAppId() {
            CACHE.loadValue(CACHE.APP_ID_KEY).then((value) => {
                setAppid(value || null);
                setIsVisible(!!value);
            });
        }
        loadAppId();
        CACHE.subscribe("PriceComparison", loadAppId);

        return () => {
            CACHE.unsubscribe("PriceComparison");
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        if(appId){
            setLoading(true);
            isThereAnyDealService.getIsThereAnyDealGameFromSteamAppId(appId).then((gameData) => {
                if (cancelled) return;
                setGame(gameData)
                return isThereAnyDealService.getBestDealForGameId(gameData.id);
            }).then((dealResult: DealResult | undefined) => {
                if (cancelled || !dealResult) return;
                setDeal(dealResult.bestDeal);
                setHistoricalLow(dealResult.historicalLow);
            }).catch((error: Error) => {
                console.error(error);
            }).finally(() => {
                if (!cancelled) setLoading(false);
            })
        }
        else {
            setIsVisible(false);
            setDeal(null);
            setHistoricalLow(null);
            setGame(null);
        }
        return () => { cancelled = true; };
    }, [appId])

    useEffect(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setMeasuredHeight(rect.height || BUTTON_HEIGHT);
    }, [deal, historicalLow, loading, isVisible, appId]);

    if (!isVisible || !appId) {
        return null;
    }

    return (
        <div
            ref={containerRef}
            style={{
                display: "flex",
                flexDirection: "row",
                gap: 8,
                width: "auto",
                zIndex: 7002,
                position: "fixed",
                bottom: `${SAFE_ZONE_FROM_BOTTOM}px`,
                left: `${LEFT_SAFE_MARGIN}px`,
                transform: `translateY(${isVisible ? 0 : measuredHeight + 12}px)`,
                transition: "transform 0.22s cubic-bezier(0, 0.73, 0.48, 1)",
            }}>
            <button
                style={{
                    width: BUTTON_WIDTH,
                    height: BUTTON_HEIGHT,
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: deal
                        ? "#1b2838" // Steam Dark Navy
                        : "rgba(255,255,255,0.08)",
                    color: "#c7d5e0", // Steam Blue vs Steam Grey text
                    fontWeight: 600,
                    fontSize: 13,
                    whiteSpace: "nowrap",
                    cursor: deal ? "pointer" : "default",
                }}
                disabled={!game}
                onClick={() => game && Navigation.NavigateToExternalWeb(`https://isthereanydeal.com/game/${game.slug}/info/`)}
            >
                {deal
                    ? `Now ${formatPrice(deal.price.currency, deal.price.amount)}`
                    : loading
                        ? "Searching…"
                        : "No deal"}
            </button>
            <button
                style={{
                    width: BUTTON_WIDTH,
                    height: BUTTON_HEIGHT,
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: game ? "#00a3da" : "rgba(255,255,255,0.05)", // ITAD Brand Blue
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 13,
                    whiteSpace: "nowrap",
                    cursor: game ? "pointer" : "default",
                }}
                disabled={!game}
                onClick={() => game && Navigation.NavigateToExternalWeb(`https://isthereanydeal.com/game/${game.slug}/history/`)}
            >
                {historicalLow !== null && historicalLow !== Infinity && deal
                    ? `Low ${formatPrice(deal.price.currency, historicalLow)}`
                    : (game ? `View` : loading ? "…" : "—")}
            </button>
        </div>
    )
}

export default PriceComparison