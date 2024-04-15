import { Navigation, findModuleChild, staticClasses } from 'decky-frontend-lib';
import { useEffect, useState } from 'react'
import { globalStates } from '../utils/GlobalStates';
import { isThereAnyDealService } from '../service/IsThereAnyDealService';
import { Game } from '../models/Game';

const PriceComparison = () => {
  const [appId, setAppid] = useState()
  const [game, setGame] = useState<Game>()
  const [label, setLabel] = useState("")

  useEffect(() => {
    function loadAppId() {
      globalStates.loadAppId().then(setAppid);
    }

    loadAppId();
    globalStates.subscribe("PriceComparison", loadAppId);

    return () => {
      globalStates.unsubscribe("PriceComparison");
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
        }).catch((error: Error) => {
          setLabel(error.message)
          console.log(error)
        })
        setGame(game)
      })
      .catch((error: Error) => {
        setLabel(error.message)
      })
    }
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
      width: 400,
      display: "flex",
      flexDirection: "row",
      gap: 12,
      alignItems: "center",
      flexWrap: "nowrap",
      paddingLeft: 16,
      paddingRight: 16,
      paddingTop: 7,
      paddingBottom: 10,
      zIndex: 7002, // volume bar is 7000
      position: "fixed",
      bottom: 0, // position at the bottom of the screen
      left: '50%', // position at the middle of the screen
      transform: `translateX(-50%) translateY(${appId ? 0 : 100}%)`, // center the div and move it up or down based on appId
      transition: "transform 0.22s cubic-bezier(0, 0.73, 0.48, 1)",
    }}>
      {label}
    </div> 
  )
  
}

export default PriceComparison