# 🎯 Toast Notification System - Usage Guide

## Import
```typescript
import { toast } from '$lib/stores/toast';
```

## Basic Usage

### Success
```typescript
toast.success('Link added');
toast.success('Theme saved successfully');
```

### Error
```typescript
toast.error('Failed to upload image');
toast.error('Connection lost. Please try again.');
```

### Warning
```typescript
toast.warning('Please enter a valid URL');
toast.warning('This action cannot be undone');
```

### Info
```typescript
toast.info('Icon color changed');
toast.info('Settings updated');
```

## Advanced Usage

### Custom Duration
```typescript
toast.success('Quick message', { duration: 2000 }); // 2 seconds
toast.error('Important error', { duration: 10000 }); // 10 seconds
```

### With Action Button (Undo)
```typescript
toast.success('Link deleted', {
  duration: 5000,
  action: {
    label: 'Undo',
    onClick: () => {
      // Restore deleted item
      restoreLink();
    }
  }
});
```

## Default Durations
- Success: 3 seconds
- Info: 3 seconds
- Warning: 5 seconds
- Error: 7 seconds

## Features
- ✅ Auto-dismiss with countdown
- ✅ Pause on hover
- ✅ Swipe to dismiss (mobile)
- ✅ Stack multiple toasts (max 5)
- ✅ Smooth animations
- ✅ Accessible (ARIA labels)
- ✅ Action buttons (Undo, etc.)

## Best Practices
1. Keep messages short (1-2 lines max)
2. Use action-oriented language ("Link added" not "Success")
3. Provide undo for destructive actions
4. Don't spam - debounce rapid actions
5. Use appropriate type (success/error/warning/info)
