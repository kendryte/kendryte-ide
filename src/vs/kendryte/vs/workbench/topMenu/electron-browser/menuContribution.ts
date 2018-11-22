import { MenuId, MenuRegistry } from 'vs/platform/actions/common/actions';
import { ApplicationMenuStructure, MyMenu, MyMenuRegistry, MyMenuSeparator, MySubMenu } from 'vs/kendryte/vs/base/common/menu/applicationMenuStructure';

let lastMenuId = 5000;

function createMenu(s: MyMenuRegistry, parent: MenuId) {
	let currentIndex = 0, className = 'kendryte_menu_' + parent.toFixed(0);
	s.forEach((item, index) => {
		if (item instanceof MyMenuSeparator) {
			currentIndex++;
			className = item.id;
		} else if (item instanceof MyMenu) {
			MenuRegistry.appendMenuItem(parent, {
				title: item.title,
				group: currentIndex + '_' + className,
				order: index,
				command: {
					id: item.commandId,
					title: item.title,
				},
			});
		} else if (item instanceof MySubMenu) {
			lastMenuId++;
			MenuRegistry.appendMenuItem(parent, {
				title: item.title,
				group: currentIndex + '_' + className,
				order: index,
				submenu: lastMenuId,
			});
			createMenu(item.submenu, lastMenuId);
		}
	});
}

createMenu(ApplicationMenuStructure, MenuId.MenubarMaixMenu);
