import { useEffect, useState, useRef } from 'react';
import './App.css';
import { getItems, selectItems, sortItems } from './redux/slices/sessionSlice';
import { useDispatch, useSelector } from 'react-redux';
import { SortableItem } from './components/SortableItem';
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

  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);
  const isFirstLoad = useRef(true);
  // const selectedIds = useSelector(state => state.sessionSlice.selectedIds)
  // const [selectedIds, setSelectedIds] = useState([]);


  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  useEffect(() => {
    dispatch(getItems({offset: offset}))
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
    try {
    await dispatch(selectItems(id)).unwrap();
    // await dispatch(getItems(offset));
  } catch (err) {
    console.error('Ошибка при выборе элемента:', err);
  }
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

  // const handleSelectAll = () => {
  //   if (selectedIds.length === storeItems.length) {
  //     setSelectedIds([]);
  //   } else {
  //     setSelectedIds(storeItems.map((item) => item.id));
  //   }
  // };

  return (
    <div className="p-4 max-w-md mx-auto border rounded-lg shadow bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold">Список с drag-and-drop</h2>
        {/* <button
          onClick={handleSelectAll}
          className="text-sm text-blue-500 hover:underline"
        >
          {selectedIds.length === storeItems.length ? 'Снять все' : 'Выбрать все'}
        </button> */}
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
        {/* Выбрано: {selectedIds.length} из {storeItems.length} */}
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

