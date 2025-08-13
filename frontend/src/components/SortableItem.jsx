import { useSortable} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


export const SortableItem = ({ item, isSelected, toggleSelection, dragDisabled }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "pointer"
  };

   const dragProps = dragDisabled ? {} : { ...attributes, ...listeners };

  return (
     <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 border rounded bg-white shadow-sm
                  ${dragDisabled ? 'cursor-default' : 'cursor-grab hover:bg-gray-50'}`}
      {...dragProps}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => toggleSelection(item.id)}
         style={{ transform: 'scale(1.4)' }}
      />
      <span className="flex-1 cursor-move" {...attributes} {...listeners}>
        {item.name}
      </span>
    </li>
  );
};
