import { assert, createMockedFunction, clearStore, test, newMockEvent, newMockCall, countEntities, mockIpfsFile, beforeAll, describe, afterEach, afterAll, mockInBlockStore, clearInBlockStore } from "matchstick-as/assembly/index"


import { MemePresale } from "../generated/schema"
import { Address, bigInt, Bytes, log } from "@graphprotocol/graph-ts"

import { BIGINT_ONE, BIGINT_ZERO } from "../src/constants"


// Define a simple class or type alias to represent PresaleData
class PresaleData {
  id: string;
  name: string;
  graduated: boolean;
  marketCap: string;
  totalsupply: string;
  lastPrice: string;
  presalePrice: string;

  constructor(
    id: string, 
    name: string, 
    graduated: boolean, 
    marketCap: string, 
    totalsupply: string, 
    lastPrice: string, 
    presalePrice: string
  ) {
    this.id = id;
    this.name = name;
    this.graduated = graduated;
    this.marketCap = marketCap;
    this.totalsupply = totalsupply;
    this.lastPrice = lastPrice;
    this.presalePrice = presalePrice;
  }
}

const mockData = [
  new PresaleData("0x718c91defb9bb79c591d95d1f04b44f0d78fdb65", "Rocket Sloth", true, "23806349265000000000000000", "1000000000000", "23806349265000", "23656176"),
  new PresaleData("0xeb958016aff490c65d9d8a8569816124384fb64e", "obama prism", true, "25253755143190000000", "10000000", "2525375514319", "2525375514319"),
  new PresaleData("0xb1766ae45aaaba0739d29f35dec0b8ff8cdb8d74", "lid", true, "25630637821650000000000000", "10000000", "2563063782165000000", "2537638618509"),
  new PresaleData("0xe265effcf192db8a437d13bc16d7e233502cf947", "Lorem Ipsum", true, "25525022933725000000000000", "10000000", "2552502293372500000", "2536282540788"),
  new PresaleData("0x660a3bed81154374dc0fe77f03eb57a2cd864e83", "Tiered Example", false, "0", "1000000000000", "25311214", "25311214"),
  new PresaleData("0xb3618b8bfd570f5ba0ed79243de2db37bd74219e", "Landscape Test", true, "25644585370140000000", "10000000", "2564458537014", "2564458537014"),
  new PresaleData("0x900a5d642627c8f85687d4afd2749f726285260c", "Google Employees", true, "25699043533410000000", "10000000", "2569904353341", "2569904353341"),
  new PresaleData("0x51d4c6103bb3293461cd84f1c066c6422238f38a", "not rickroll", false, "0", "1000000000000", "25681523", "25681523"),
  new PresaleData("0x7eab8d3d72912cc2786bb067ffd5748b3c618150", "DICKBUTT", false, "0", "10000000", "2687882467801", "2687882467801"),
  new PresaleData("0xbd05d2de24f4bd0c0682e7f634c79df3a50f9450", "KAJILLION", false, "0", "10000000", "2777000878722", "2777000878722"),
  new PresaleData("0x02705b7d587ef5999a11d08f51b3b87094897499", "Raaj", true, "0", "1000000000", "10000", "0"),
  new PresaleData("0x3e07f9a46b45d2add2f8085f56c1ec040ceb6d7d", "Bagman", true, "0", "1000000000", "10000", "0"),
  new PresaleData("0x71531805191a27a09bdb3c23980c152482701aa4", "PEPEUSD", true, "10000000000000000000000000000000000000000", "100000000", "100000000000000000000000000000000", "0"),
  new PresaleData("0xcf0d6b0b251fd3a9bd83f721c75e695662333892", "Boink", true, "0", "1000000000", "10000", "0"),
  new PresaleData("0x2d6e63bd60e6808e192b757e94350dd1ea14b302", "shmol", false, "0", "10000000", "2600453381765", "2600453381765"),
  new PresaleData("0x4078d7e32ab47031126990d6c118f5af40d51fe3", "howzat", true, "0", "10000000", "2572876714798", "2572876714798"),
  new PresaleData("0x29311c7e348aa3caaafcd467e8530a246a8112e9", "howzat", false, "0", "10000000", "2541070621117", "2541070621117"),
  new PresaleData("0x33f6211831af97c955036ce807d28d96290b5b65", "Bongos", false, "0", "100000000", "253752133103", "253752133103"),
  new PresaleData("0x07480ca2c55a4277b2465a7542b1deb5e4cc2a4f", "Ghoulish Coffee", false, "0", "10000000", "2537521331038", "2537521331038"),
  new PresaleData("0xdd2e7af406ab850d65c9011f5700b442848c213d", "OH MY STARS", false, "0", "10000000", "2527605058098", "2527605058098"),
  new PresaleData("0x9b3b4f30605f838f78eb8bba1a0297fd30f66231", "OH MY STARS 2", false, "0", "10000000", "2527605058098", "2527605058098"),
  new PresaleData("0xdc6cdd73f23b47ea60a05a9c713c81b6a7f369bc", "MEMEMEMEMEME", false, "0", "10000000", "2757555702625", "2757555702625")
];

function mockPresale(data: PresaleData): void {
  const presale = new MemePresale(data.id);
  presale.name = data.name;
  presale.symbol = data.name;
  presale.uri = "";
  
  presale.graduated = data.graduated;
  presale.readyToGraduate = false;
  presale.creator = data.id;

  presale.paircoin = Address.fromString(data.id);
  presale.pairSymbol = "UNKNOWN";
  presale.isPairERC1155 = false;
  
  presale.totalBuyCount = BIGINT_ZERO;
  presale.totalSellCount = BIGINT_ZERO;
  presale.uniqueBuyerCount = BIGINT_ZERO;
  presale.uniqueSellerCount = BIGINT_ZERO;

  presale.targetBaseTokenToRaise = bigInt.fromString("1");
  presale.returnForOne = bigInt.fromString("1");
  presale.baseTokenRaised = BIGINT_ZERO;
  presale.amounttolp = bigInt.fromString(data.totalsupply).div(bigInt.fromString("2"));
  presale.amounttosell = bigInt.fromString(data.totalsupply).div(bigInt.fromString("2"));
  presale.presalePrice = BIGINT_ONE;
  presale.lastPrice = bigInt.fromString(data.lastPrice);
  presale.marketCap = bigInt.fromString(data.marketCap);
  presale.totalsupply = bigInt.fromString(data.totalsupply);

  presale.createdAt = BIGINT_ONE;
  presale.updatedAt = BIGINT_ONE;
  presale.createdAtBlock = BIGINT_ONE;
  presale.updatedAtBlock = BIGINT_ONE;

  presale.save()
}

describe("Market caps test", () => {
  afterAll(() => {
    clearStore()
  })

  test("Calculate market caps", () => {
    for (let i = 0; i < mockData.length; i++) {
      const data = mockData[i]

      mockPresale(data)
      const presale = MemePresale.load(data.id)
      if(!presale) return
        
      log.info("\nstart : {} \t - mcap: {} - graduated?: {} - price: {}", [presale.name, presale.marketCap.toString(), presale.graduated ? 'Yes' : 'No', presale.graduated ? presale.lastPrice.toString() : presale.presalePrice.toString()])
      if (!presale.graduated) {
        // For presale phase, use presale price
        presale.marketCap = presale.totalsupply.times(presale.presalePrice);
      } else {
        // For graduated tokens, use the last transaction price in WETH
        presale.marketCap = presale.totalsupply.times(presale.lastPrice);
      }
  
      log.info("\tfinal supply: {}", [presale.totalsupply.toString()])
      log.info("\tfinal mcap  : {}", [presale.marketCap.toString()])

    }
    
  })
})