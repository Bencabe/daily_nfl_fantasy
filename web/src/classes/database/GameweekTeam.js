class GameweekTeam {
    constructor(dbArray) {
        if (!dbArray){
            dbArray = []
        }
        this.goalkeepers = dbArray[3] ? JSON.parse(dbArray[3]) : []
        this.defenders = dbArray[4] ? JSON.parse(dbArray[4]) : []
        this.midfielders = dbArray[5] ? JSON.parse(dbArray[5]) : []
        this.forwards = dbArray[6] ? JSON.parse(dbArray[6]) : []
        this.subs = dbArray[7] ? JSON.parse(dbArray[7]) : []
    }

}

export default GameweekTeam