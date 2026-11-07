import type { ComponentType } from 'react';
import { BadgePage, ButtonPage, CardPage, EmptyStatePage, FormSectionPage, IconBoxPage, LoadingSpinnerPage, WhatsAppButtonPage } from './display';
import { DataTablePage, SkeletonPage, TabsPage } from './data';
import { CheckboxPage, RadioCardGroupPage, SelectInputPage, TextAreaPage, TextInputPage } from './inputs';
import { AppShellPage, ConfirmDialogPage, DrawerPage, ModalPage, ToastPage } from './overlays';
import { AutocompletePage, MonthCalendarPage } from './search';
import { IconButtonPage, LinkButtonPage } from './site';

export interface DemoEntry {
  id: string;
  name: string;
  group: string;
  summary: string;
  Page: ComponentType;
}

export const demos: DemoEntry[] = [
  { id: 'button', name: 'Button', group: 'Primitives', summary: 'Sketch-bordered actions in seven variants and three sizes.', Page: ButtonPage },
  { id: 'link-button', name: 'LinkButton', group: 'Primitives', summary: 'A link that looks like a Button.', Page: LinkButtonPage },
  { id: 'icon-button', name: 'IconButton', group: 'Primitives', summary: 'Icon-only button with a 44px hit area.', Page: IconButtonPage },
  { id: 'badge', name: 'Badge', group: 'Primitives', summary: 'Small status tags.', Page: BadgePage },
  { id: 'card', name: 'Card', group: 'Primitives', summary: 'Containers with optional header and footer.', Page: CardPage },
  { id: 'icon-box', name: 'IconBox', group: 'Primitives', summary: 'A tinted well for an icon.', Page: IconBoxPage },
  { id: 'loading-spinner', name: 'LoadingSpinner', group: 'Primitives', summary: 'Dual-ring spinner, inline or as an overlay.', Page: LoadingSpinnerPage },
  { id: 'skeleton', name: 'Skeleton', group: 'Primitives', summary: 'Placeholders while content loads.', Page: SkeletonPage },
  { id: 'whatsapp-button', name: 'WhatsAppButton', group: 'Primitives', summary: 'A wa.me link with brand colors.', Page: WhatsAppButtonPage },
  { id: 'empty-state', name: 'EmptyState', group: 'Composition', summary: 'A friendly view for empty lists.', Page: EmptyStatePage },
  { id: 'form-section', name: 'FormSection', group: 'Composition', summary: 'Numbered steps for long forms.', Page: FormSectionPage },
  { id: 'text-input', name: 'TextInput', group: 'Forms', summary: 'Labelled text field with helper and error text.', Page: TextInputPage },
  { id: 'text-area', name: 'TextArea', group: 'Forms', summary: 'Multi-line text field.', Page: TextAreaPage },
  { id: 'select-input', name: 'SelectInput', group: 'Forms', summary: 'Native select with the Trazos look.', Page: SelectInputPage },
  { id: 'checkbox', name: 'Checkbox', group: 'Forms', summary: 'Hand-drawn checkbox.', Page: CheckboxPage },
  { id: 'radio-card-group', name: 'RadioCardGroup', group: 'Forms', summary: 'Options as selectable cards (native radios).', Page: RadioCardGroupPage },
  { id: 'autocomplete', name: 'Autocomplete', group: 'Forms', summary: 'Debounced async search with keyboard navigation.', Page: AutocompletePage },
  { id: 'data-table', name: 'DataTable', group: 'Data and navigation', summary: 'Typed rows with loading and empty states.', Page: DataTablePage },
  { id: 'tabs', name: 'Tabs', group: 'Data and navigation', summary: 'Underline, pills and contained tabs.', Page: TabsPage },
  { id: 'month-calendar', name: 'MonthCalendar', group: 'Data and navigation', summary: 'Month grid with colored event chips.', Page: MonthCalendarPage },
  { id: 'modal', name: 'Modal', group: 'Overlays', summary: 'Dialogs with focus trap and Escape to close.', Page: ModalPage },
  { id: 'drawer', name: 'Drawer', group: 'Overlays', summary: 'Slide-out panel for mobile navigation.', Page: DrawerPage },
  { id: 'confirm-dialog', name: 'ConfirmDialog', group: 'Overlays', summary: 'Promise-based confirmation: await confirm().', Page: ConfirmDialogPage },
  { id: 'toast', name: 'Toast', group: 'Overlays', summary: 'Notifications via useToast().', Page: ToastPage },
  { id: 'app-shell', name: 'AppShell', group: 'Layout', summary: 'Sidebar, top bar and mobile drawer layout.', Page: AppShellPage },
];

export const groups = [...new Set(demos.map((d) => d.group))];
