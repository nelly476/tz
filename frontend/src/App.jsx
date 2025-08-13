import { useEffect, useState, useRef, useCallback } from 'react';
import './App.css';
import { getItems, selectItems, sortItems } from './redux/slices/sessionSlice';
import { useDispatch, useSelector } from 'react-redux';
import { SortableItem } from './components/SortableItem';
import { SearchInput } from './components/SearchInput';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';


const App = () => {
  const dispatch = useDispatch();
  const storeItems = useSelector((state) => state.sessionSlice.data);
  const [offset, setOffset] = useState(0);
const [searchVal, setSearchVal] = useState(() => {
  // читаем из localStorage один раз при инициализации
  return localStorage.getItem('searchVal') ?? '';
});

  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);
  const isFirstLoad = useRef(true);


  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  useEffect(() => {
  localStorage.setItem('searchVal', searchVal);
}, [searchVal]);

  useEffect(() => {
    dispatch(getItems({offset: offset, search: searchVal}))
   
  }, [offset, dispatch]);

  useEffect(() => {
  if (!loaderRef.current || !hasMore) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        // Пропускаем первый вызов
        if (isFirstLoad.current) {
          isFirstLoad.current = false;
          return;
        }
        
        setOffset((prev) => prev + 20);
      }
    },
    { threshold: 1.0 }
  );

  observer.observe(loaderRef.current);

  return () => observer.disconnect();
}, [loaderRef, hasMore]);

  const toggleSelection = async (id) => {
    await dispatch(selectItems({id, search: searchVal})).unwrap();
      
  
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = storeItems.findIndex((i) => i.id === active.id);
      const newIndex = storeItems.findIndex((i) => i.id === over.id);
      const reorderedList = arrayMove(storeItems, oldIndex, newIndex)

      // console.log(reorderedList)
      // console.log(storeItems)
      dispatch(sortItems({reorderedList, oldIndex, newIndex}))
    }
  };

   const handleSearch = useCallback((query) => {
    // Сбрасываем offset при новом поиске
    dispatch(getItems({ offset: 0, limit: 20, search: query }));
     if (searchVal === "") {
      setOffset(0)
     }
  }, [dispatch]);


  return (
    <div className="p-4 max-w-md mx-auto border rounded-lg shadow bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold">Список с drag-and-drop</h2>
           <SearchInput
      placeholder="Найти элементы…"
      delay={400}
      onSearch={handleSearch}
      autoFocus
      searchVal={searchVal}
      setSearchVal={setSearchVal}
    />
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={storeItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <ul className="space-y-2">
            {storeItems.map((item) => (
              <SortableItem
                key={item.id}
                item={item}
                isSelected={item.isSelected}
                toggleSelection={toggleSelection}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <div className="mt-4 text-sm text-gray-500">
      </div>

       {hasMore && (
        <div ref={loaderRef} className="text-center py-4 text-gray-500">
          Загрузка...
        </div>
      )}

    </div>
  );
};

export default App;

