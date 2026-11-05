import {
  AppShell,
  Button,
  ConfirmDialogProvider,
  Drawer,
  Modal,
  ToastProvider,
  useConfirm,
  useToast,
  type ModalSize,
} from '@carandev/trazos-ui';
import { useState } from 'react';
import { Demo, Row } from '../Demo';

const sizes: ModalSize[] = ['small', 'medium', 'large'];

export function ModalPage() {
  const [size, setSize] = useState<ModalSize | null>(null);
  return (
    <Demo title="Sizes" description="Escape, the close button or the backdrop close it. Focus stays inside while open." code={`<Modal open={open} onOpenChange={setOpen} title="Edit flow" footer={…}>…</Modal>`}>
      <Row>
        {sizes.map((s) => (
          <Button
            key={s}
            variant="outline"
            onClick={() => {
              setSize(s);
            }}
          >
            Open {s}
          </Button>
        ))}
      </Row>
      <Modal
        open={size !== null}
        onOpenChange={(open) => {
          if (!open) setSize(null);
        }}
        size={size ?? 'medium'}
        title="Rename flow"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setSize(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setSize(null);
              }}
            >
              Save
            </Button>
          </>
        }
      >
        <p>This is a {size} modal. Press Tab to cycle through its buttons.</p>
      </Modal>
    </Demo>
  );
}

export function DrawerPage() {
  const [open, setOpen] = useState(false);
  return (
    <Demo title="Default" description="On small screens the drawer slides in from the side; Escape closes it." code={`<Drawer open={open} onOpenChange={setOpen} title="Menu">…</Drawer>`}>
      <Button
        onClick={() => {
          setOpen(true);
        }}
      >
        Open drawer
      </Button>
      <Drawer open={open} onOpenChange={setOpen} title="Menu">
        <nav aria-label="Drawer demo">
          <p>Inbox</p>
          <p>Flows</p>
          <p>Settings</p>
        </nav>
      </Drawer>
    </Demo>
  );
}

function ConfirmDemo() {
  const confirm = useConfirm();
  const [result, setResult] = useState('none');
  return (
    <Row>
      <Button
        variant="wine"
        onClick={() => {
          void confirm('This flow will be deleted for everyone.', {
            title: 'Delete flow?',
            confirmText: 'Delete',
            cancelText: 'Keep it',
            confirmVariant: 'wine',
          }).then((ok) => {
            setResult(ok ? 'confirmed' : 'cancelled');
          });
        }}
      >
        Delete flow
      </Button>
      <span>Result: {result}</span>
    </Row>
  );
}

export function ConfirmDialogPage() {
  return (
    <Demo
      title="useConfirm()"
      description="Wrap the app once in ConfirmDialogProvider (AppShell already does), then await confirm()."
      code={`const confirm = useConfirm();\nif (await confirm('Delete this flow?')) { … }`}
    >
      <ConfirmDialogProvider>
        <ConfirmDemo />
      </ConfirmDialogProvider>
    </Demo>
  );
}

function ToastDemo() {
  const toast = useToast();
  return (
    <Row>
      <Button
        onClick={() => {
          toast.showSuccess('Flow published.', 'Done');
        }}
      >
        Success
      </Button>
      <Button
        variant="wine"
        onClick={() => {
          toast.showError('The message could not be sent.');
        }}
      >
        Error
      </Button>
      <Button
        variant="cream"
        onClick={() => {
          toast.showWarning('Your session expires in 5 minutes.');
        }}
      >
        Warning
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          toast.showInfo('A new version is available.');
        }}
      >
        Info
      </Button>
    </Row>
  );
}

export function ToastPage() {
  return (
    <Demo
      title="useToast()"
      description="Wrap the app once in ToastProvider (AppShell already does). Toasts close after 5 seconds."
      code={`const toast = useToast();\ntoast.showSuccess('Saved', 'Done');`}
    >
      <ToastProvider>
        <ToastDemo />
      </ToastProvider>
    </Demo>
  );
}

export function AppShellPage() {
  return (
    <Demo
      title="Layout"
      description="Sidebar on desktop, top bar with a drawer on mobile, plus an optional environment badge. Shown here in a framed preview."
      code={`<AppShell brand={…} sidebar={…} topBar={…} isDevelopment environmentName="DEV">…</AppShell>`}
    >
      <div style={{ height: 420, overflow: 'auto', transform: 'translateZ(0)', border: '1px dashed var(--trazos-border)' }}>
        <AppShell
          brand={<span className="trazos-heading">Acme Inbox</span>}
          sidebar={
            <nav aria-label="Main">
              <p>Inbox</p>
              <p>Flows</p>
              <p>Contacts</p>
            </nav>
          }
          topBar={<span>Welcome back</span>}
          drawerContent={
            <nav aria-label="Main (mobile)">
              <p>Inbox</p>
              <p>Flows</p>
            </nav>
          }
          isDevelopment
          environmentName="DEV"
        >
          <p style={{ padding: '1rem' }}>Page content goes here.</p>
        </AppShell>
      </div>
    </Demo>
  );
}
