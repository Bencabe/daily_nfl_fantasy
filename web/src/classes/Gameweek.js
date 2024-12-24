import {connect} from 'react-redux'
import { setSelectedGameweek } from '../pages/Team/TeamSelectReducer'

console.log(setSelectedGameweek)
const mapDispatchtoProps = () => {
    return {
        setSelectedGameweek,
    };
}

class Gameweek{
    static initialising = false
    static selected = undefined
    constructor(dbArray) {
        if (!Gameweek.initialising) {
            throw new Error('attempting to initialise with private constructor')
        }
        this.id = dbArray[0]
        this.number = dbArray[1]
        this.seasonId = dbArray[2]
        this.startDate = dbArray[3]
        this.endDate = dbArray[4]
        this.current = dbArray[5]
    }

    static update(dbArray) {
        Gameweek.initialising = true
        Gameweek.selected = new Gameweek(dbArray)
        Gameweek.initialising = false
        Gameweek.updateRedux()
        return Gameweek.selected
    }

    static updateRedux() {
        setSelectedGameweek(Gameweek.selected.serialize())
    }

    updateNumber(operation) {
        Gameweek.selected.numer = operation == 'add' ? Gameweek.selected.number + 1 : Gameweek.selected.number - 1
        Gameweek.updateRedux()
    }

    serialize() {
        return {
            id: this.id,
            number: this.number,
            seasonId: this.seasonId,
            startDate: this.startDate,
            endDate: this.endDate,
            current: this.current
        }
    }

    // deserialize(serializedGameweek) {
    //     for (const [key,]  of serializedGameweek) {
    //         des
    //     }
    // }
    // mapStateToProps = state => ({
    //     user: JSON.parse(window.localStorage.getItem('user')) || state.auth.user,
    //     team: state.team
    // });
    
}

// const mapDispatchToProps = () => {
//     return{
//         setPlayers
//     };
// }

// const mapStateToProps = state => ({
//     user: JSON.parse(window.localStorage.getItem('user')) || state.auth.user,
//     loggedIn: JSON.parse(window.localStorage.getItem('loggedIn')) || state.auth.loggedIn,
//     team: state.team
// });

    

// }

export default connect(mapDispatchtoProps())(Gameweek)