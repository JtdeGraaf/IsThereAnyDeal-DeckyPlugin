import { ServerAPI, ServerResponse } from "decky-frontend-lib";
import { Deal } from "../models/Deal";
import { Game } from "../models/Game";
import { SETTINGS, Setting } from "../utils/Settings";
import { CACHE } from "../utils/Cache";

interface DealResponse {
    id: string;
    deals: Deal[];
}

interface GameResponse {
    found: boolean;
    game: Game;
}

interface ServerResponseResult {
    body: string
}

export let isThereAnyDealService: IsThereAnyDealService

export class IsThereAnyDealService {
  private readonly serverAPI: ServerAPI;
  // I know this basically does nothing, but it makes me feel better
  private readonly notWhatYouThinkItIs = "T1dabE4yUTRObVUxWldWaE9HUTJaVFF5TkRCbFpXVmpaR1UzWVdRME0yVTRNbVF3Wldaa01nPT0="

  constructor(serverAPI: ServerAPI) {
    this.serverAPI = serverAPI;
  }

  static init(serverAPI: ServerAPI) {
    isThereAnyDealService = new IsThereAnyDealService(serverAPI);
  }

  public getIsThereAnyDealGameFromSteamAppId = async (appId:string): Promise<Game> => {
    const gameCacheKeyBase = "steamAppIdToItadGame-"

    // Check if game exists in cache if so return it
    const game = await CACHE.loadValue(gameCacheKeyBase + appId)
    if(game) return game;

    // Get the isThereAnyDeal gameID from a steam appId
    const serverResponseGameId: ServerResponse<ServerResponseResult> =
                    await this.serverAPI.fetchNoCors<ServerResponseResult>(
                        `https://api.isthereanydeal.com/games/lookup/v1?key=${atob(atob(this.notWhatYouThinkItIs))}&appid=${appId}`,
                        {
                            method: 'GET',
                        }
                    );
    
    
    if(!serverResponseGameId.success) throw new Error("Game does not exist on IsThereAnyDeal")
    const gameResponse: GameResponse = JSON.parse(serverResponseGameId.result.body) 

    // Save game to cache to minimize API calls
    CACHE.setValue(gameCacheKeyBase + appId, gameResponse.game)

    return gameResponse.game
  }


  public getBestDealForGameId = async (gameId: string): Promise<Deal> => { 
    
    const country: string = await SETTINGS.load(Setting.COUNTRY)
    const allowVouchersInPrices = await SETTINGS.load(Setting.ALLOW_VOUCHERS_IN_PRICES)
    
    // Use the new gameId to fetch the best deal for it

    const serverResponseDeals: ServerResponse<ServerResponseResult> = 
        await this.serverAPI.fetchNoCors<ServerResponseResult>(
        `https://api.isthereanydeal.com/games/prices/v2?key=${atob(atob(this.notWhatYouThinkItIs))}&country=${country}&nondeals=true&vouchers=${allowVouchersInPrices}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            //@ts-ignore
            json: [gameId],
        }
    );
    

    if(!serverResponseDeals.success) throw new Error("IsThereAnyDeal is unavailable")
    const dealResponse: DealResponse[] = JSON.parse(serverResponseDeals.result.body)
    if(dealResponse.length <= 0  || dealResponse[0].deals.length <= 0 ) throw new Error("No deals found")
    
    // Initialize variables to track the lowest price deal
    let lowestPrice = Infinity;
    let lowestPriceDeal = null;
    let steamDeal = null;
    const STEAM_SHOP_ID = 61

    // Iterate over all deals to find the one with the lowest price
    for (const deal of dealResponse[0].deals) {
        
        if(deal.shop.id === STEAM_SHOP_ID){
            steamDeal = deal
        }
        if (deal.price.amount < lowestPrice) {
            lowestPrice = deal.price.amount;
            lowestPriceDeal = deal;
        }
    }

    // Check if a deal with the lowest price was found
    if (!lowestPriceDeal) throw new Error("No deals found")
    
    // Check if the lowestPriceDeal is the same price as on Steam if so return the steamdeal
    if(steamDeal && steamDeal.price.amount === lowestPriceDeal.price.amount) return steamDeal
    return lowestPriceDeal
  }


}

