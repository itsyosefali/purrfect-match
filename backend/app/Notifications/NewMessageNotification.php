<?php

namespace App\Notifications;

use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewMessageNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Message $message) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $conversation = $this->message->conversation;
        $listing = $conversation->catListing;
        $sender = $this->message->sender;

        return (new MailMessage)
            ->subject("New message about {$listing->name}")
            ->greeting("Hi {$notifiable->name},")
            ->line("{$sender->name} sent you a message about {$listing->name}:")
            ->line('"'.$this->message->body.'"')
            ->action('Reply in Messages', rtrim(config('app.frontend_url'), '/')."/messages?conversation={$conversation->id}")
            ->line('Thank you for using Purrfect Match!');
    }
}
