# Votings contract
Check my deployed contract at https://rinkeby.etherscan.io/address/0x31c35f816b3f50a003ee10395c8755e9aac2daa5

Сreate a voting campaign with any candidates. 
Every voter must pay a bid to vote. Every voter can vote once.
After the campaign finishing winner can withdraw all ether (except for the commission).
In the case of more than one winner, the prize is divided equally.



### 1) Create new campaign  using "createCampaign" function.  
 **Arguments**: 
 - array of candidate addresses
 - bid (in wei)
 - voting duration (in seconds)  
   
 **Example**: createCampaign(["0x1c5d9eaDB66005324780a9A76B06B6cb4b78Cd87", "0xab4d9eaDB66005324780a9A76B06B6cb4b78C254"], 1000000000, 604800)    

### 2) Vote using  "vote" function.  You can vote once.
**Arguments**: 
 -  campaign index
 -  candidate address    
    
 **Example**: vote(42, "0x1c5d9eaDB66005324780a9A76B06B6cb4b78Cd87")     


 


