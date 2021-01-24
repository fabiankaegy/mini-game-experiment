import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export default function App(props) {

    const [players, setPlayers] = useState([]);
    const [isAdded, setIsAdded] = useState( false );

    const [status, setStatus] = useState( null );

    const socket = useRef();

    const [ showRequest, setShowRequest ] = useState(false);

    useEffect(()=> {

        socket.current = io.connect("ws://192.168.1.153:3000/");

        socket.current.on("connect", data => {
            console.log("connected", data);
        });

        socket.current.on("reconnect", data => {
            console.log("reconnected", data);
        });

        socket.current.on("welcome", ({ players, status }) => {
            setStatus( status );
            setPlayers(players);
        });

        socket.current.on("disconnect", () => {
            console.log("disconnected");
        });

        socket.current.on( "player_added", ({players, status}) => {
            setPlayers( players )
            setStatus(status);
        } )

        socket.current.on( 'game_started', ({players, status}) => {
            setPlayers(players);
            setStatus(status);
        } )

        socket.current.on( 'input_request', (data) => {
            setShowRequest( true );
        } );


    }, [])

    function handleUserSubmit(event) {
        event.preventDefault();

        const username = event.target.name.value;
        socket.current.emit("add_player", { name: username });
    }

    function handleGameStart() {
        socket.current.emit( 'start_game' );
    }

    return (
        <div>
            <h1>Hallo Welt!</h1>
            <ul>
            { players.map( player => (
                <li key={player.id}>{player.name}</li>
            ) ) }
            </ul>

            { status === 'waiting_room' &&
                <>
                    <form onSubmit={handleUserSubmit}>
                        <input type="text" name="name" />
                        <input type="submit" value="Join" />
                    </form>
                    <button onClick={ handleGameStart }>Start Game</button>
                </>
            }

            { status === 'game_started' && (
                <>
                <h2>Let's Go</h2>

                { showRequest && 
                    <form onSubmit={ (event) => {
                        event.preventDefault();

                        const value = event.target.value.value;
                        socket.current.emit( 'request_answer', value )
                    } }>
                        <input type="text" name="value" />
                        <input type="submit" value="submit" />
                    </form>
                }
                </>
            ) }
        </div>
    )
}