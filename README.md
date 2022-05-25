# Votings contract
Check my contract at https://rinkeby.etherscan.io/address/0x5Ca6c1D9d9b6D215deAADdD490429D207Da16562

Сreate a voting campaign with any candidates. 
Every voter must pay a bid to vote. Every voter can vote once.
After the campaign finishing, winner can withdraw all ether (except for the commission).
In the case of more than one winner, the prize is divided equally.


### 1) Create new campaign  using "createCampaign" function.  
 **Arguments**: 
 - array of candidate addresses
 - bid (in wei)
 - voting duration (in seconds)  
   

### 2) Vote using  "vote" function.  You can vote once.
**Arguments**: 
 -  campaign index
 -  candidate address    
    

 ### 3) Finish campaign and withdraw prize using "finishCampaign" function.  
**Arguments**: 
 -  campaign index   
