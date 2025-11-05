// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract DomainFoundation is ERC721URIStorage, Ownable, ReentrancyGuard {
    uint256 public constant BASE_PLANT_FEE = 0.001 ether;
    uint256 public constant BASE_WATER_FEE = 0.0001 ether;
    string private constant BASE_GATE_WAY =
        "https://gateway.pinata.cloud/ipfs/";

    enum DonationLevel {
        BRONZE,
        SILVER,
        GOLD
    }
    enum GrowthStage {
        SEED,
        SPROUT,
        GROWING,
        ADULT
    }

    struct Plant {
        uint256 id;
        address owner;
        GrowthStage stage;
        uint256 plantedDate;
        uint256 lastWatered;
        uint8 waterLevel;
        uint16 quantity;
        bool exists;
        bool isDead;
    }

    mapping(uint256 => Plant) public plants;
    mapping(address => uint256[]) public userPlants;
    uint256 public plantCounter;

    uint256 public constant STAGE_DURATION = 1 minutes;
    uint256 public constant WATER_DEPLETION_TIME = 30 seconds;
    uint8 public constant WATER_DEPLETION_RATE = 20;

    event PlantSeeded(address indexed owner, uint256 indexed plantId);
    event PlantWatered(uint256 indexed plantId, uint8 newWaterLevel);
    event PlantAdult(
        uint256 indexed plantId,
        address indexed owner,
        DonationLevel level
    );
    event StageAdvanced(uint256 indexed plantId, GrowthStage newStage);
    event PlantDied(uint256 indexed plantId);

    constructor() ERC721("Domain Fondation", "DOMF") Ownable(msg.sender) {}

    function plantSeed(uint16 quantity) external payable returns (uint256) {
        require(quantity > 0, "Quantity must be greater than 0");

        uint256 MIN_DEPOSIT = BASE_PLANT_FEE * quantity;
        string memory minEth = weiToEth(MIN_DEPOSIT);

        require(
            msg.value >= MIN_DEPOSIT,
            string(abi.encodePacked("Need ", minEth, " ETH to plant"))
        );

        plantCounter++;
        uint256 newPlantId = plantCounter;

        plants[newPlantId] = Plant({
            id: newPlantId,
            owner: msg.sender,
            stage: GrowthStage.SEED,
            plantedDate: block.timestamp,
            lastWatered: block.timestamp,
            waterLevel: 100,
            quantity: quantity,
            exists: true,
            isDead: false
        });

        userPlants[msg.sender].push(newPlantId);
        emit PlantSeeded(msg.sender, newPlantId);

        return newPlantId;
    }

    function calculateWaterLevel(uint256 plantId) public view returns (uint8) {
        Plant storage plant = plants[plantId];

        if (!plant.exists || plant.isDead) {
            return 0;
        }

        uint256 timeSinceWatered = block.timestamp - plant.lastWatered;
        uint256 depletionIntervals = timeSinceWatered / WATER_DEPLETION_TIME;

        uint256 waterLost = depletionIntervals * WATER_DEPLETION_RATE;

        if (waterLost >= plant.waterLevel) {
            return 0;
        }

        return plant.waterLevel - uint8(waterLost);
    }

    function updateWaterLevel(uint256 plantId) internal {
        Plant storage plant = plants[plantId];

        uint8 currentWater = calculateWaterLevel(plantId);
        plant.waterLevel = currentWater;

        if (currentWater == 0 && !plant.isDead) {
            plant.isDead = true;
            emit PlantDied(plantId);
        }
    }

    function waterPlant(uint256 plantId) external payable {
        Plant storage plant = plants[plantId];
        uint256 MIN_DEPOSIT = BASE_WATER_FEE * plant.quantity;
        string memory minEth = weiToEth(MIN_DEPOSIT);

        require(plant.exists, "Plant doesn't exist");
        require(plant.owner == msg.sender, "Not your plant");
        require(!plant.isDead, "Plant is dead");
        require(
            msg.value >= MIN_DEPOSIT,
            string(abi.encodePacked("Need ", minEth, " ETH to plant"))
        );

        uint256 depoValue = (msg.value / MIN_DEPOSIT);
        uint256 bonus = (depoValue - 1) * 20;

        uint256 finalWater = 100 + bonus;
        if (finalWater > 255) {
            finalWater = 255;
        }

        plant.waterLevel = uint8(finalWater);
        plant.lastWatered = block.timestamp;

        emit PlantWatered(plantId, plant.waterLevel);

        updatePlantStage(plantId);
    }

    function updatePlantStage(uint256 plantId) public {
        Plant storage plant = plants[plantId];
        require(plant.exists, "Plant doesn't exist");

        updateWaterLevel(plantId);

        if (plant.isDead) {
            return;
        }

        uint256 timeSincePlanted = block.timestamp - plant.plantedDate;
        GrowthStage oldStage = plant.stage;

        if (
            timeSincePlanted >= STAGE_DURATION &&
            plant.stage == GrowthStage.SEED
        ) {
            plant.stage = GrowthStage.SPROUT;
        } else if (
            timeSincePlanted >= 2 * STAGE_DURATION &&
            plant.stage == GrowthStage.SPROUT
        ) {
            plant.stage = GrowthStage.GROWING;
        } else if (
            timeSincePlanted >= 3 * STAGE_DURATION &&
            plant.stage == GrowthStage.GROWING
        ) {
            plant.stage = GrowthStage.ADULT;
        }

        if (plant.stage != oldStage) {
            emit StageAdvanced(plantId, plant.stage);
        }
    }

    function getNFT(uint256 plantId, string memory uri) external {
        Plant storage plant = plants[plantId];
        require(plant.exists, "Plant doesn't exist");
        require(plant.owner == msg.sender, "Not your plant");
        require(!plant.isDead, "Plant is dead");

        updatePlantStage(plantId);
        require(plant.stage == GrowthStage.ADULT, "Plant not ready");

        DonationLevel level;
        string memory tokenURI = string(abi.encodePacked(BASE_GATE_WAY, uri));

        if (plant.quantity <= 5) {
            level = DonationLevel.BRONZE;
        } else if (plant.quantity > 5 && plant.quantity <= 10) {
            level = DonationLevel.SILVER;
        } else {
            level = DonationLevel.GOLD;
        }

        _safeMint(plant.owner, plant.id);
        _setTokenURI(plant.id, tokenURI);

        plant.exists = false;
        emit PlantAdult(plantId, msg.sender, level);
    }

    function weiToEth(uint256 weiAmount) internal pure returns (string memory) {
        uint256 ETH_DECIMALS = 1e18;
        uint256 integer = weiAmount / ETH_DECIMALS;
        uint256 decimals = weiAmount % ETH_DECIMALS;

        if (decimals == 0) {
            return Strings.toString(integer);
        }

        bytes memory buffer = new bytes(18);
        uint256 temp = decimals;
        for (uint256 i = 18; i > 0; i--) {
            buffer[i - 1] = bytes1(uint8(48 + (temp % 10)));
            temp /= 10;
        }

        uint256 length = 18;
        while (length > 0 && buffer[length - 1] == bytes1("0")) {
            length--;
        }

        bytes memory decimalsTrimmed = new bytes(length);
        for (uint256 i = 0; i < length; i++) {
            decimalsTrimmed[i] = buffer[i];
        }

        return
            string(
                abi.encodePacked(
                    Strings.toString(integer),
                    ".",
                    decimalsTrimmed
                )
            );
    }

    function getPlant(uint256 plantId) external view returns (Plant memory) {
        Plant memory plant = plants[plantId];
        plant.waterLevel = calculateWaterLevel(plantId);
        return plant;
    }

    function getUserPlants(
        address user
    ) external view returns (uint256[] memory) {
        return userPlants[user];
    }

    function withdraw() external nonReentrant {
        require(msg.sender == owner(), "Not owner");
        address payable receiver = payable(owner());

        (bool success, ) = receiver.call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }

    receive() external payable {}
}
