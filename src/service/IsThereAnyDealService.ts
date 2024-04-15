import { ServerAPI, ServerResponse } from "decky-frontend-lib";
import { Deal } from "../models/Deal";

interface DealResponse {
    id: string;
    deals: Deal[];
}

interface Game {
    id: string;
    slug: string;
    title: string;
    type: null;
    mature: boolean;
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
  private readonly API_KEY = ""

  constructor(serverAPI: ServerAPI) {
    this.serverAPI = serverAPI;
  }

  static init(serverAPI: ServerAPI) {
    isThereAnyDealService = new IsThereAnyDealService(serverAPI);
  }

  private getIsThereAnyDealGameIdFromSteamAppId = async (appId:string) => {
    // Get the isThereAnyDeal gameID from a steam appId
    const serverResponseGameId: ServerResponse<ServerResponseResult> =
                    await this.serverAPI.fetchNoCors<ServerResponseResult>(
                        `https://api.isthereanydeal.com/games/lookup/v1?key=${this.API_KEY}&appid=${appId}`,
                        {
                            method: 'GET',
                        }
                    );
    
    
    if(!serverResponseGameId.success) throw new Error("Game does not exist on IsThereAnyDeal")
    const gameResponse: GameResponse = JSON.parse(serverResponseGameId.result.body) 
    return gameResponse.game.id
  }


  public getBestDealForSteamAppId = async (appId: string): Promise<Deal> => { 
    
    const isThereAnyDealGameId = await this.getIsThereAnyDealGameIdFromSteamAppId(appId)

    const country: string = await SteamClient.User.GetIPCountry()
    
    // Use the new gameId to fetch the best deal for it

    const serverResponseDeals: ServerResponse<ServerResponseResult> = 
        await this.serverAPI.fetchNoCors<ServerResponseResult>(
        `https://api.isthereanydeal.com/games/prices/v2?key=${this.API_KEY}&country=${country}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            //@ts-ignore
            json: [isThereAnyDealGameId],
        }
    );
    

    if(!serverResponseDeals.success) throw new Error("IsThereAnyDeal is unavailable")
    const dealResponse: DealResponse[] = JSON.parse(serverResponseDeals.result.body)
    if(dealResponse.length <= 0  || dealResponse[0].deals.length <= 0 ) throw new Error("No deals found")
    
    // Initialize variables to track the lowest price deal
    let lowestPrice = Infinity;
    let lowestPriceDeal = null;

    // Iterate over all deals to find the one with the lowest price
    for (const deal of dealResponse[0].deals) {
        console.log(deal)
        if (deal.price.amount < lowestPrice) {
            lowestPrice = deal.price.amount;
            lowestPriceDeal = deal;
        }
    }

    // Check if a deal with the lowest price was found
    if (!lowestPriceDeal) throw new Error("No deals found")
    return lowestPriceDeal
  }


}

