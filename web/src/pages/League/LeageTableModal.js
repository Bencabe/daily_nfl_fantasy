// import React, { useState }  from "react";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue} from "@nextui-org/react";
import { getLeagueTeams } from '../../middleware/leagues'
import {useEffect} from 'react'
// import ReactDOM from 'react-dom';


const rows = [];

const columns = [];

function LeagueTable (props) {

    useEffect(() => {
        console.log(props)
        getLeagueTeams(props.leagueId).then(
            result => {
                console.log(props.leagueId)
                console.log(result)
                // for (let i=0; i<result.length; i++){
                //     rows.push({
                //         key: i,
                //         teamName: result[i][0],
                //         score: result[i][1]
                //     })
                // }
            }
        )
        console.log(rows)
    }, [props.leagueId])


    return (
        // <></>
        // <NextUIProvider>
        <Table bordered isStriped>
            <TableHeader>
                <TableColumn>Position</TableColumn>
                <TableColumn>Team Name</TableColumn>
                <TableColumn>Score</TableColumn>
            </TableHeader>
            <TableBody>
                {/* <TableRow key="1">
                <TableCell>Tony Reichert</TableCell>
                <TableCell>CEO</TableCell>
                <TableCell>Active</TableCell>
                </TableRow>
                <TableRow key="2">
                <TableCell>Zoey Lang</TableCell>
                <TableCell>Technical Lead</TableCell>
                <TableCell>Paused</TableCell>
                </TableRow>
                <TableRow key="3">
                <TableCell>Jane Fisher</TableCell>
                <TableCell>Senior Developer</TableCell>
                <TableCell>Active</TableCell>
                </TableRow>
                <TableRow key="4">
                <TableCell>William Howard</TableCell>
                <TableCell>Community Manager</TableCell>
                <TableCell>Vacation</TableCell>
                    </TableRow> */}
                </TableBody>
            </Table>
    )

}

export default LeagueTable