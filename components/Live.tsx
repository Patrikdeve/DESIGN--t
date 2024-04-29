import React, { useCallback, useEffect, useState } from 'react'
import LiveCursors from './cursor/LiveCursors'
import { useBroadcastEvent, useEventListener, useMyPresence, useOthers } from '@/liveblocks.config'
import CursorChat from './cursor/CursorChat';
import { CursorMode, CursorState, Reaction, ReactionEvent } from '@/types/type';
import ReactionSelector from './reaction/ReactionButton';
import FlyingReaction from './reaction/FlyingReaction';
import useInterval from '@/hooks/useInterval';

type Props = {
    canvasRef:React.MutableRefObject<HTMLCanvasElement | null>;
}
const Live = ({canvasRef}: Props) => {
    const others = useOthers();//This return the list of the other members in the room

    const [{cursor}, updateMyPresence] = useMyPresence() as any; 

    //Need to create the cursor state here
    const [cursorState, setCursorState] = useState<CursorState>({mode:CursorMode.Hidden})


    //Need to create the array of reactions using useState hook
    const [reaction, setReaction] = useState<Reaction []>([])


    //to broadcast the reaction to all the room sharing members we get 
    const broadcast = useBroadcastEvent(); 
    //To implement flying reaction requires the useInterval hook special got from the one blogger
    useInterval(() => {
        if (cursorState.mode === CursorMode.Reaction && cursorState.isPressed && cursor) {
            setReaction((reactions) =>
                reactions.concat([
                    {
                        point: { x: cursor.x, y: cursor.y },
                        value: cursorState.reaction,
                        timestamp: Date.now(),
                    }
                ]))

            broadcast({
                x: cursor.x,
                y: cursor.y,
                value: cursorState.reaction
            })
        }


    }, 100)


//To actually see the reaction on others screen we require another function also which is 
useEventListener((eventData) => {
    const event = eventData.event as ReactionEvent;
    setReaction((reactions) =>
        reactions.concat([
            {
                point: { x: event.x, y: event.y },
                value: event.value,
                timestamp: Date.now(),
            }
        ]))
})


//here to ensure that the only reactions not disappera but must be cleared we will use another useInterval hook 

useInterval(()=> {
    setReaction((reactions) => reactions.filter((reaction) => reaction.timestamp > Date.now()-4000));
}, 1000)
    //Creating the functions here in order to know the position of cursors

    const handlePointerMove = useCallback((event:React.PointerEvent) => {
        event.preventDefault(); 

        //We got the Position of cursor
        if(cursor == null || cursorState.mode !== CursorMode.ReactionSelector) {
            const x = event.clientX-event.currentTarget.getBoundingClientRect().x;
            const y = event.clientY-event.currentTarget.getBoundingClientRect().y;

            updateMyPresence({cursor: {x, y}});
        }
        
    }, [])
    
    //Function to handle case when our cursor leave the canvas
    const handlePointerLeave = useCallback((event:React.PointerEvent) => {
        setCursorState({mode: CursorMode.Hidden})
        
        updateMyPresence({cursor: null, message:null });
    }, [])



    const handlePointerDown = useCallback((event:React.PointerEvent) => {

        //We got the Position of cursor
        const x = event.clientX-event.currentTarget.getBoundingClientRect().x;
        const y = event.clientY-event.currentTarget.getBoundingClientRect().y;

        updateMyPresence({cursor: {x, y}});

        setCursorState((state:CursorState) => 
            cursorState.mode === CursorMode.Reaction ? {...state,isPressed : true}:state
        )
    
    }, [cursorState.mode, setCursorState])



//Now till above livecursor is ready to implement and turn the cursor chat mode chat to hidden and vice versa we are using useEffect HOOk

    useEffect(()=>{
        
        const onKeyUp = (e:KeyboardEvent) => {
            
            if(e.key === "/") {
                setCursorState({
                    mode: CursorMode.Chat,
                    previousMessage: null, 
                    message:""
                })
            } else if(e.key === "Escape") {
                updateMyPresence({message: ""})
                setCursorState({
                    mode:CursorMode.Hidden
                })
            } else if(e.key === "e") { //For the purpose of starting the reaction selector functionality
                setCursorState({mode:CursorMode.ReactionSelector})
            }
        }

        const onKeyDown = (e:KeyboardEvent) => {
            
            if(e.key === "/") {
                e.preventDefault(); 
            }
        }

        window.addEventListener("keyup", onKeyUp); 
        window.addEventListener("keydown", onKeyDown); 

        return()=> {
            window.removeEventListener("keyup", onKeyUp); 
            window.removeEventListener("keydown", onKeyDown);
        }


    }, [updateMyPresence])



//Createing the function to handle the key up 
    const handlePointerUp = useCallback(() => {

        setCursorState((state:CursorState) =>
            cursorState.mode === CursorMode.Reaction ? {...state, isPressed:false} : state
        )


    }, [cursorState.mode,setCursorState])
 
 
 
    const setReactions = useCallback((reaction:string)=> {
            setCursorState({mode: CursorMode.Reaction, reaction, isPressed:false})
    }, [])
    return (
    <div
        id='canvas'
         onPointerMove = {handlePointerMove}
         onPointerLeave = {handlePointerLeave}
         onPointerDown = {handlePointerDown}
         onPointerUp = {handlePointerUp}
         className="h-[100vh] w-full flex justify-center items-center text-center"
    >
        {/* <h1 className="text-2xl text-white">LiveBlocks Design It</h1> */}

        <canvas ref = {canvasRef}/>

        {reaction.map((reaction) =>(
            <FlyingReaction 
                key={reaction.timestamp.toString()}
                x = {reaction.point.x}
                y = {reaction.point.y}
                timestamp={reaction.timestamp}
                value={reaction.value}
            />
        ))}
        
        {cursor && 
            <CursorChat
                cursor = {cursor}
                cursorState = {cursorState}
                setCursorState = {setCursorState}
                updateMyPresence = {updateMyPresence}
            />
        }


        {/* Now here we are adding the reactions selection functionality */}
        {cursorState.mode === CursorMode.ReactionSelector && (
            <ReactionSelector 
                setReaction={setReactions}
            />
        )}



      <LiveCursors others = {others}/>
    </div>
  )
}

export default Live
