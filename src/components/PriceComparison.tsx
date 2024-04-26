import { Navigation, staticClasses } from 'decky-frontend-lib';
import { useEffect, useState } from 'react'
import { isThereAnyDealService } from '../service/IsThereAnyDealService';
import { Game } from '../models/Game';
import { CACHE } from '../utils/Cache';
import { SETTINGS, Setting } from '../utils/Settings';

const PriceComparison = () => {
  const [appId, setAppid] = useState()
  const [game, setGame] = useState<Game>()
  const [label, setLabel] = useState("")
  const [isVisible, setIsVisible] = useState(false)
  const [paddingBottom, setPaddingBottom] = useState(SETTINGS.defaults.paddingBottom)
  const [fontSize, setFontSize] = useState(SETTINGS.defaults.fontSize)

  useEffect(() => {
    function loadAppId() {
      CACHE.loadValue(CACHE.APP_ID_KEY).then(setAppid);
      SETTINGS.load(Setting.PADDING_BOTTOM).then(setPaddingBottom)
      SETTINGS.load(Setting.FONTSIZE).then(setFontSize)
    }
    loadAppId();
    CACHE.subscribe("PriceComparison", loadAppId);




    return () => {
      CACHE.unsubscribe("PriceComparison");
    };
  }, []);

  useEffect(() => {
    if(appId){
      isThereAnyDealService.getIsThereAnyDealGameFromSteamAppId(appId).then((game) => {
        isThereAnyDealService.getBestDealForGameId(game.id).then((deal) => {
          const price = deal.price;
          const store = deal.shop.name;

          // Return the result
          setLabel(`Lowest price on ${store}: ${price.currency} ${price.amount}`);
          setIsVisible(true)
        }).catch((error: Error) => {
          setLabel(error.message)
          setIsVisible(true)
        })
        setGame(game)
      })
      .catch((error: Error) => {
        setLabel(error.message)
        setIsVisible(true)
      })
    }
    else setIsVisible(false)
  }, [appId])

  

  return (
    <div
    className={staticClasses.PanelSectionTitle}

    onClick={async () => {
      game && Navigation.NavigateToExternalWeb(
        `https://isthereanydeal.com/game/${game.slug}/info/`
      )
    }}
    
    style={{
      width: 420,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      flexWrap: "wrap",
      paddingLeft: 16,
      paddingRight: 16,
      paddingTop: 7,
      paddingBottom: paddingBottom,
      fontSize: fontSize,
      zIndex: 7002, // volume bar is 7000
      position: "fixed",
      bottom: 0, // position at the bottom of the screen
      left: '50%', // position at the middle of the screen
      transform: `translateX(-50%) translateY(${isVisible ? 0 : 100}%)`, // center the div and move it up or down based on appId
      transition: "transform 0.22s cubic-bezier(0, 0.73, 0.48, 1)",
    }}>
      {label}
    </div> 
  )
  
}

export default PriceComparison