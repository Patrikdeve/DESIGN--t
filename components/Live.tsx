import React, { useCallback } from 'react'
import LiveCursors from './cursor/LiveCursors'
import { useMyPresence, useOthers } from '@/liveblocks.config'

const Live = () => {
    const others = useOthers();//This return the list of the other members in the room

    const [{cursor}, updateMyPresence] = useMyPresence() as any; 

    //Creating the functions here in order to know the position of cursors

    const handlePointerMove = useCallback((event:React.PointerEvent) => {
        event.preventDefault(); 

        //We got the Position of cursor
        const x = event.clientX-event.currentTarget.getBoundingClientRect().x;
        const y = event.clientY-event.currentTarget.getBoundingClientRect().y;

        updateMyPresence({cursor: {x, y}});
    }, [])
    
    //Function to handle case when our cursor leave the canvas
    const handlePointerLeave = useCallback((event:React.PointerEvent) => {
        event.preventDefault(); 
        updateMyPresence({cursor: null, message:null });
    }, [])



    const handlePointerDown = useCallback((event:React.PointerEvent) => {

        //We got the Position of cursor
        const x = event.clientX-event.currentTarget.getBoundingClientRect().x;
        const y = event.clientY-event.currentTarget.getBoundingClientRect().y;

        updateMyPresence({cursor: {x, y}});
    }, [])






  return (
    <div
         onPointerMove = {handlePointerMove}
         onPointerLeave = {handlePointerLeave}
         onPointerDown = {handlePointerDown}
         className="h-[100vh] w-full flex justify-center items-center text-center"
    >
        <h1 className="text-2xl text-white">LiveBlocks Design It</h1>
      <LiveCursors others = {others}/>
    </div>
  )
}

export default Live
