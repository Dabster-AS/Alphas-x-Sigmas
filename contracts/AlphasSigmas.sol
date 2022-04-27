// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract AlphasSigmas is ERC721, ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _maleTokenIdCounter;
    Counters.Counter private _femaleTokenIdCounter;

    string private baseURIMain;
    string private baseURIEnding;

    address public clubNFTAddress;

    uint256 public maxFemaleCount;
    uint256 public maxMaleCount;

    uint256 public maleMintPrice;
    uint256 public femaleMintPrice;

    mapping(uint256 => bool) NFTusedMale;
    mapping(uint256 => bool) NFTusedFemale;

    constructor(address _clubNFTAddress) ERC721("AlphasSigmas", "AxS") {
        clubNFTAddress = _clubNFTAddress;

        maxMaleCount = 10000;
        maxFemaleCount = 8000;
        maleMintPrice = 0.5 ether;
        femaleMintPrice = 0.5 ether;
    }

    //TODO mabe we want to be able to mint more than one

    function publicMaleMint() public payable {
        require(msg.value == maleMintPrice, "not correct amount");
        _maleMint(msg.sender);
    }

    function publicFemaleMint() public payable {
        require(msg.value == femaleMintPrice, "not correct amount");
        _femaleMint(msg.sender);
    }

    function clubPassMintMale() public {
        uint256 passId = _checkAddressEligibility(msg.sender, NFTusedMale);
        NFTusedMale[passId] = true;
        _maleMint(msg.sender);
    }

    function clubPassMintFemle() public {
        uint256 passId = _checkAddressEligibility(msg.sender, NFTusedFemale);
        NFTusedFemale[passId] = true;
        _femaleMint(msg.sender);
    }

    function _maleMint(address to) private {
        uint256 tokenId = _maleTokenIdCounter.current() + maxFemaleCount;
        require(
            tokenId < (maxFemaleCount + maxMaleCount),
            "All males have been minted"
        );
        _maleTokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    function _femaleMint(address to) private {
        uint256 tokenId = _femaleTokenIdCounter.current();
        require(tokenId < (maxFemaleCount), "All females have been minted");
        _femaleTokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    function _checkAddressEligibility(
        address addr,
        mapping(uint256 => bool) storage _NFTUsed
    ) internal view returns (uint256 res) {
        for (uint256 i = 0; i < ERC721(clubNFTAddress).balanceOf(addr); i++) {
            uint256 id = ERC721Enumerable(clubNFTAddress).tokenOfOwnerByIndex(
                addr,
                i
            );
            if (!_NFTUsed[id]) return id;
        }
        revert("address not eligible");
    }

    function setURI(string memory main, string memory ending) public onlyOwner {
        baseURIMain = main;
        baseURIEnding = ending;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        // TODO ??? require(_tokenIdCounter.current() > tokenId, "tokenId not minted");
        return
            string(
                abi.encodePacked(
                    baseURIMain,
                    Strings.toString(tokenId),
                    baseURIEnding
                )
            );
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
