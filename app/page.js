'use client'

import { useState, useEffect, useRef } from 'react'
import { Box, Stack, Typography, Button, TextField } from '@mui/material'
import { firestore } from '@/firebase'
import {Camera} from "react-camera-pro";
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import styles from "./page.css";
import { Modal } from '@mui/base/Modal';

import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

export default function Home() {
  const [item, setItem]= useState('');
  const [inventory, setInventory] = useState([])

  const camera = useRef (null);
  const [image, setImage] = useState(null);
  const [images, setImages] = useState([]);

  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const [newEditedItem, setNewEditedItem] = useState(null);
  const [newQuantity, setQuantity] = useState(0);

  const [open, setOpen] = useState(false);

  const [newName, setNewName] = useState('');

  const [edited, setEdited]= useState(false);

  const resetInventory = async () =>{
    // need to add new item to inventory 
    try {
      const q = query(collection(firestore, "inventory"));
      const docs = await getDocs(q);
      const newItem = []
      docs.forEach((doc)=>{
        newItem.push ({
          name: doc.id, 
          ...doc.data(),
      });
      });
      setInventory(newItem);
    }
    catch(e){
      console.error(e);
    }
  };
  
  useEffect(()=>{
    resetInventory();
  }, [])
  
  const handleDeleteItem = async(item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if(docSnap.exists()){
      const {quantity} = docSnap.data();

    // check if the item exists in the collection, if it does remove it from the collection
      if (quantity === 1){
        await deleteDoc(docRef)
      }

    // otherwise if it already exists in the collection then decrement the count by one 
      else{
        await setDoc(docRef, {
          quantity: quantity - 1,
        });
      }

      await resetInventory();
    }
  }

  const handleAddItem = async() => {
      const docRef = doc(collection(firestore, "inventory"), item);
      const docSnap = await getDoc(docRef);  

      if(docSnap.exists()){
        const {quantity} = docSnap.data();
          await setDoc(docRef, {
            quantity: quantity+1,
        })}
        
      else {
        await setDoc(docRef, {quantity: 1})
      }
      await resetInventory();
      setItem('');
  }

  const handleEdit = async() => {
    if(newEditedItem){
      const oldRef = doc(collection(firestore, "inventory"), newEditedItem.name)
      const newRef = doc(collection(firestore, "inventory"), newName);

      if(newEditedItem.name !== newName){
        await deleteDoc(oldRef)
      }

        await setDoc(newRef, {
          quantity: newQuantity,
        })
    
    await resetInventory();
    handleClose();
    }
  }

  function openModal(item){
    setOpen(true);
    setNewEditedItem(item);
    setNewName(item.name);
    setQuantity(item.quantity);
  }

  function handleClose() {
    setOpen(false);
  }

  return (
    <Box className="center-box">
      <Box className="mainTitle-container">
        <Typography className="title"variant="h1">Pantry Pro AI</Typography>
        
        <Box className="search-bar-container">
        <TextField 
          id="outlined-controlled"
          label="Search"
          value={item}
          onChange ={(e) => setItem(e.target.value)
        }
        fullWidth
        />
        </Box>
    </Box>

    <Box className="items-main-container">
      <Box className="text-container">
        <Box className="btns-toggle-container">
          <Box className="newItems-container">
          <Box><h2 className="new-item-title">Add new item to pantry</h2></Box>
          <Button className="add-item-container" variant = "contained" onClick={()=>handleAddItem()}>
            Add Item
          </Button>
         
        <Box className="camera-container">
          {isCameraOpen && 
        (<Camera ref={camera}/>)}
          {image && <img src={image} alt="image preview"/>}
        <Button
            variant = "contained"
            onClick={()=>{
              if(isCameraOpen){
                const photo=camera.current.takePhoto();
                setImage(photo);
                setImages((prevImages)=>photo, ...images); 
              }
            }}>
          {isCameraOpen ? "Take Photo": "Close Camera"}
        </Button>

        <Button
          variant = "contained"
          onClick={() => setIsCameraOpen(!isCameraOpen)}>
            {isCameraOpen ? "Close Camera": "Take Photo"}
        </Button>
        </Box>

        </Box>
        </Box>

        <Box className="btns-toggle-container">
          <Box className="inner-delete-items-container"> 
          <h2 className="delete-btn-title"> Delete item from pantry! </h2>
            <Button className="delete-item-container" variant="contained" onClick={()=>handleDeleteItem(item)}>
              Delete Item
            </Button>
        </Box>
        </Box>
      </Box>

      <Box className="items-container">
        <h1 className="items-container-title">Add any items to get started!</h1>
          {inventory.map(item=>(
              (<Box className="item-container" key={item.name}>
                <Box className="items-container-text"><Typography variant = "h6">{item.name}</Typography>
                <Typography>Quanity: {item.quantity}</Typography>
                </Box>
                <Button className="update-item-container" variant = "contained" onClick={()=>openModal(item)}>
                Edit Item
              </Button>             
            </Box>  )  
          ))}
        </Box>
      </Box>

      <Modal className="modal-container" open={open} onClose={handleClose}>
            <Box>
            
            <Typography className="modal-title" variant="h6">Edit Item</Typography>
            <TextField className="modal-text-container"
              label="Item Name"
              value={newName} 
              onChange={(e)=>setNewName(e.target.value)}
            />

            <TextField className="modal-text-container"
              label="Enter new quantity"
              type="number"
              value={newQuantity} 
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              />

          <Box className="btn-container">
            <Button className="submit-btn" onClick={handleEdit}>
              Submit New Edit
            </Button>

            <Button className="closeModal-btn" onClick={handleClose}>
              Close Modal
            </Button>
            </Box>
            </Box>
        </Modal>

    </Box>
  )
}

