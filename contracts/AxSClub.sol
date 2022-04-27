// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract AxSClub is ERC721, ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    bytes32 public whitelistMerkleRoot;
    mapping(address => bool) private whitelistClaimed;

    string private baseURIMain;
    string private baseURIEnding;

    uint256 public mintPrice;

    uint256 public maxSupply;

    constructor() ERC721("AxSClub", "AxS") {
        maxSupply = 1111;
        mintPrice = 0.05 ether;
    }

    function safeMint(address to) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        require((tokenId < maxSupply), "All NFTs are minted");
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    function whitelistMint(uint256 whitelistNumber, bytes32[] memory proof)
        public
        payable
    {
        uint256 tokenId = _tokenIdCounter.current();
        require((tokenId < maxSupply), "All NFTs are minted");
        require(msg.value == mintPrice, "not correct amount");
        require(!whitelistClaimed[msg.sender], "address already minted NFT");

        require(
            _verifyMerkleLeaf(
                _generateWhitelistMerkleLeaf(msg.sender, whitelistNumber),
                proof
            ),
            "address not owning number"
        );

        _tokenIdCounter.increment();
        whitelistClaimed[msg.sender] = true;
        _safeMint(msg.sender, tokenId);
    }

    function setWhitelistMerkleRoot(bytes32 _root) external onlyOwner {
        whitelistMerkleRoot = _root;
    }

    function _generateWhitelistMerkleLeaf(address _account, uint256 _tokenId)
        internal
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_tokenId, _account));
    }

    function _verifyMerkleLeaf(bytes32 _leafNode, bytes32[] memory _proof)
        internal
        view
        returns (bool)
    {
        return MerkleProof.verify(_proof, whitelistMerkleRoot, _leafNode);
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
        require(_tokenIdCounter.current() > tokenId, "tokenId not minted");
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
