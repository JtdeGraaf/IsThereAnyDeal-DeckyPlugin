import { ServerAPI, ServerResponse } from "decky-frontend-lib";

export interface Deal {
    shop: {
        id: number;
        name: string;
    };
    price: {
        amount: number;
        amountInt: number;
        currency: string;
    };
    regular: {
        amount: number;
        amountInt: number;
        currency: string;
    };
    cut: number;
    voucher: null | string;
    storeLow: {
        amount: number;
        amountInt: number;
        currency: string;
    };
    historyLow: {
        amount: number;
        amountInt: number;
        currency: string;
    };
    flag: string;
    drm: {
        id: number;
        name: string;
    }[];
    platforms: {
        id: number;
        name: string;
    }[];
    timestamp: string;
    expiry: string | null;
    url: string;
}

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

  constructor(serverAPI: ServerAPI) {
    this.serverAPI = serverAPI;
  }

  static init(serverAPI: ServerAPI) {
    isThereAnyDealService = new IsThereAnyDealService(serverAPI);
  }

  getBestDealForSteamAppId = async (appId: string) => {
    const API_KEY = ""

    // Get the isThereAnyDeal gameID from a steam appId
    const serverResponseGameId: ServerResponse<ServerResponseResult> =
                    await this.serverAPI.fetchNoCors<ServerResponseResult>(
                        `https://api.isthereanydeal.com/games/lookup/v1?key=${API_KEY}&appid=${appId}`,
                        {
                            method: 'GET',
                        }
                    );
    
    
    if(!serverResponseGameId.success) return "No deals found"
    const gameResponse: GameResponse = JSON.parse(serverResponseGameId.result.body) 
    const isThereAnyDealGameId = gameResponse.game.id
    
    // Use the new gameId to fetch the best deal for it

    const serverResponseDeals: ServerResponse<ServerResponseResult> = 
        await this.serverAPI.fetchNoCors<ServerResponseResult>(
        `https://api.isthereanydeal.com/games/prices/v2?key=${API_KEY}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            //@ts-ignore
            json: [isThereAnyDealGameId],
        }
    );
    

    if(!serverResponseDeals.success) return "No deals found"
    const dealResponse: DealResponse[] = JSON.parse(serverResponseDeals.result.body)
    if(dealResponse.length <= 0  || dealResponse[0].deals.length <= 0 ) return "No deals found"
    const price = dealResponse[0].deals[0].price
    const store = dealResponse[0].deals[0].shop.name
    return `${store}: ${price.currency} ${price.amount}`
  }


}

