import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './index.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import ShoppingList from './ShoppingList';
import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useTranslation, Trans } from 'react-i18next';
import Axios from "axios";


const App = () => {
  const [localItems, setLocalItems] = useState([]);
  const { t } = useTranslation();
  const [listInputValues, setListInputValues] = useState({});

  //update data
  useEffect(() => {
    Axios.get("http://localhost:3001/getLists")
      .then((response) => {
        console.log(response.data); // Check the structure
        setData({ lists: response.data });
      })
      .catch(error => console.error("Fetching data failed:", error));
  }, []);


  const [isLightMode, setIsLightMode] = useState(false);

  const toggleTheme = () => {
    setIsLightMode((prevMode) => !prevMode);
  };

  useEffect(() => {
    document.body.classList.toggle('dark-mode', !isLightMode);
  }, [isLightMode]);


  const [data, setData] = useState({
    lists: [
      { listName: 'MyList1', listOwner: 'You', items: [] }, //Jako v ukolu na BE
    ],
  });

  const [totalItemCount, setTotalItemCount] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [inputValueList, setInputValueList] = useState('');

  const handleAddItem = (listIndex, inputValue) => {
    const newItem = {
      itemName: inputValue,
      quantity: 1,
      isSelected: false,
    };

    setData((prevData) => {
      const newLists = [...prevData.lists];
      newLists[listIndex].items = [...newLists[listIndex].items, newItem];

      return { lists: newLists };
    });

    calculateTotal();
  };
  //Prida pocet v konkretnim listu a u konkretniho item indexu
  const handleQuantityPlus = (listIndex, itemIndex) => {
    setData((prevData) => {
      const newLists = [...prevData.lists];
      const newItems = [...newLists[listIndex].items];
      newItems[itemIndex].quantity++;
      newLists[listIndex].items = newItems;

      return { lists: newLists };
    });

    calculateTotal(); //Update total count
  };

  const handleQuantityMinus = (listIndex, itemIndex) => {
    setData((prevData) => {
      const newLists = [...prevData.lists];
      const newItems = [...newLists[listIndex].items];

      if (newItems[itemIndex].quantity > 1) {
        newItems[itemIndex].quantity--;
      } else {
        newItems.splice(itemIndex, 1);
      }

      newLists[listIndex].items = newItems;

      return { lists: newLists };
    });

    calculateTotal();
  };

  const removeList = (listId) => {
    Axios.delete(`http://localhost:3001/deleteList/${listId}`)
      .then((response) => {
        setData((prevData) => ({
          lists: prevData.lists.filter((list) => list._id !== listId),
        }));
      })
      .catch((error) => {
        console.error("Error deleting the list:", error);
        // Handle error
      });
  };


  const calculateTotal = () => {
    const totalItemCount = data.lists.reduce((total, list) => {
      return total + list.items.reduce((listTotal, item) => (item.isSelected ? listTotal + item.quantity : listTotal), 0);
    }, 0);
    setTotalItemCount(totalItemCount);
  };
  //Pridat novy list
  const addNewShoppingList = () => {
    const newList = { listName: inputValue, listOwner: 'You', items: [] };
    Axios.post('http://localhost:3001/createList', newList)
      .then((response) => {
        setData((prevData) => ({ lists: [...prevData.lists, response.data] }));
        setInputValue('');
      })
      .catch((error) => {
        console.error('Error adding new shopping list:', error);
      });
  };

  const handleEditListName = (listId, newName) => {
    if (newName.trim() !== '') {
      Axios.patch(`http://localhost:3001/updateListName/${listId}`, { listName: newName })
        .then((response) => {
          // Update the local state to reflect the new list name
          setData((prevData) => ({
            lists: prevData.lists.map((list) => {
              if (list._id === listId) {
                return { ...list, listName: newName };
              }
              return list;
            }),
          }));
          setInputValueList(''); // Reset the input value after successful update
        })
        .catch((error) => {
          console.error('Error updating list name:', error);
        });
    }
  };



  const handleToggleComplete = (listIndex, itemIndex) => {
    setData((prevData) => {
      const newLists = [...prevData.lists];
      newLists[listIndex].items[itemIndex].isSelected = !newLists[listIndex].items[itemIndex].isSelected;
      return { lists: newLists };
    });
  };

  useEffect(() => {
    calculateTotal();
  }, [data.lists]);

  // Function to handle input change for a specific list
  const handleInputChange = (event, listId) => {
    const { value } = event.target;
    setListInputValues((prevInputValues) => ({
      ...prevInputValues,
      [listId]: value, // Update input value for the corresponding list ID
    }));
  };

  // Function to get the input value for a specific list
  const getInputValue = (listId) => {
    return listInputValues[listId] || ''; // Return the input value if available, otherwise empty string
  };

  return (
    <Router>
      <div className={`app-background ${isLightMode ? 'app-background' : 'dark-mode'}`}>
        <div className='main-container'>
          <div className='add-item-box'>
            <input
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  addNewShoppingList();
                }
              }}
              className={`change-list-name ${isLightMode ? '' : 'dark-mode'}`}
              style={{ color: isLightMode ? 'var(--text-light)' : 'var(--text-dark)' }}
              placeholder="Přidat list..."
            />
            <FontAwesomeIcon icon={faPlus} onClick={addNewShoppingList} />
          </div>
          <div className='item-list'>
            <TransitionGroup>
              {data.lists.map((list, listIndex) => (
                <CSSTransition key={list._id} timeout={500} classNames="item">
                  <div className='item-container'>
                    <div className='item-name'>
                      <span>
                        <input
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault(); // Prevent form submission
                              handleEditListName(list._id, getInputValue(list._id));
                            }
                          }}
                          onChange={(event) => handleInputChange(event, list._id)}
                          value={getInputValue(list._id)}
                          placeholder={list.listName}
                          style={{ color: isLightMode ? 'var(--text-light)' : 'var(--text-dark)' }}
                          className={`change-list-name ${isLightMode ? '' : 'dark-mode'}`}
                        />

                      </span>
                    </div>
                    <Link to={`/shopping-list/${listIndex}`}>
                      <FontAwesomeIcon icon={faInfoCircle} />
                    </Link>
                    <div>
                      <button>
                        <FontAwesomeIcon
                          icon={faTrash}
                          className="beat-animation"
                          onClick={() => removeList(list._id)}
                        />
                      </button>
                    </div>

                  </div>
                </CSSTransition>
              ))}
              <FormGroup>
                <FormControlLabel control={<Switch checked={isLightMode} onChange={toggleTheme} />} label='dark/light mode' />
              </FormGroup>
            </TransitionGroup>
          </div>
        </div>
        <Routes>
          {data.lists.map((list, listIndex) => (
            <Route
              key={listIndex}
              path={`/shopping-list/${listIndex}`}
              element={
                <ShoppingList
                  listId={list._id}
                  listName={list.listName}
                  listOwner={list.listOwner}
                  isLightMode={isLightMode}
                  items={list.items}
                  onAddItem={(inputValue) => handleAddItem(listIndex, inputValue)}
                  onQuantityPlus={(itemIndex) => handleQuantityPlus(listIndex, itemIndex)}
                  onQuantityMinus={(itemIndex) => handleQuantityMinus(listIndex, itemIndex)}
                  onToggleComplete={(itemIndex) => handleToggleComplete(listIndex, itemIndex)}
                />
              }
            />
          ))}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
