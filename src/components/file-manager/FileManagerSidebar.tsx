import { useState } from "react";
import { ChevronDown, ChevronRight, Folder, FolderOpen, User, Plus, Calendar, Phone, Mail, FileImage, FileText, Users, MoreHorizontal, History, Star, Heart, Bookmark, Clock, Settings, Database, Globe, Camera, Music, Video, Image, Code, Briefcase, Target, Trophy, Flag, Bell, Shield, Home, Building, Coffee, Gift, ShoppingCart, TrendingUp, BarChart, Activity, Map, Navigation, Sun, Cloud, Flower, Share2, Handshake, Gem, FileSignature } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { FileItem, FolderNode } from "@/types/fileManager";

interface FileManagerSidebarProps {
  folderTree: FolderNode[];
  currentFolderId: string | null;
  onFolderSelect: (folderId: string | null) => void;
  onCreateFolder: (parentId?: string) => void;
  currentCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

export function FileManagerSidebar({
  folderTree,
  currentFolderId,
  onFolderSelect,
  onCreateFolder,
  currentCategory,
  onCategorySelect,
}: FileManagerSidebarProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [customCategories, setCustomCategories] = useState<Array<{id: string | null, name: string, icon: JSX.Element}>>([]);
  const [selectedIcon, setSelectedIcon] = useState<string>('FileText');

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const availableIcons = [
    { name: 'FileText', icon: FileText, label: 'File' },
    { name: 'Users', icon: Users, label: 'Teams' },
    { name: 'Star', icon: Star, label: 'Save' },
    { name: 'Heart', icon: Heart, label: 'Like' },
    { name: 'Bookmark', icon: Bookmark, label: 'Bookmark' },
    { name: 'Calendar', icon: Calendar, label: 'Calendar' },
    { name: 'Clock', icon: Clock, label: 'Time' },
    { name: 'Settings', icon: Settings, label: 'Setting' },
    { name: 'Database', icon: Database, label: 'Database' },
    { name: 'Globe', icon: Globe, label: 'Globe' },
    { name: 'Camera', icon: Camera, label: 'Camera' },
    { name: 'Music', icon: Music, label: 'Music' },
    { name: 'Video', icon: Video, label: 'Video' },
    { name: 'Image', icon: Image, label: 'Image' },
    { name: 'Code', icon: Code, label: 'Code' },
    { name: 'Briefcase', icon: Briefcase, label: 'Briefcase' },
    { name: 'Target', icon: Target, label: 'Target' },
    { name: 'Trophy', icon: Trophy, label: 'Trophy' },
    { name: 'Flag', icon: Flag, label: 'Flag' },
    { name: 'Bell', icon: Bell, label: 'Bell' },
    { name: 'Shield', icon: Shield, label: 'Shield' },
    { name: 'Home', icon: Home, label: 'Home' },
    { name: 'Building', icon: Building, label: 'Building' },
    { name: 'Coffee', icon: Coffee, label: 'Coffee' },
    { name: 'Gift', icon: Gift, label: 'Gift' },
    { name: 'ShoppingCart', icon: ShoppingCart, label: 'ShoppingCart' },
    { name: 'TrendingUp', icon: TrendingUp, label: 'TrendingUp' },
    { name: 'BarChart', icon: BarChart, label: 'BarChart' },
    { name: 'Activity', icon: Activity, label: 'Activity' },
    { name: 'Map', icon: Map, label: 'Map' },
    { name: 'Navigation', icon: Navigation, label: 'Navigation' },
    { name: 'Sun', icon: Sun, label: 'Sun' },
    { name: 'Cloud', icon: Cloud, label: 'Cloud' },
    { name: 'Flower', icon: Flower, label: 'Flower' }
  ];

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      const selectedIconData = availableIcons.find(icon => icon.name === selectedIcon);
      const IconComponent = selectedIconData?.icon || FileText;

      const newCategory = {
        id: `custom-${Date.now()}`,
        name: newCategoryName.trim(),
        icon: <IconComponent className="h-4 w-4 text-purple-500" />
      };
      setCustomCategories(prev => [...prev, newCategory]);
      setNewCategoryName("");
      setSelectedIcon('FileText');
      setIsCreateCategoryOpen(false);
    }
  };

  const renderFolderNode = (node: FolderNode, depth = 0) => {
    const isExpanded = expandedNodes.has(node.item.id);
    const isSelected = currentFolderId === node.item.id;
    const hasChildren = node.children.length > 0;

    return (
      <div key={node.item.id}>
        <div 
          className={cn(
            "flex items-center w-full transition-smooth rounded-lg cursor-pointer py-2 px-2 mx-2 my-1",
            isSelected && "text-primary font-medium",
            !isSelected && "hover:bg-file-item-hover"
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => onFolderSelect(node.item.id)}
        >
          <div className="flex items-center gap-2 flex-1">
            {hasChildren && (
              <div
                className="h-4 w-4 p-0 hover:bg-secondary rounded flex items-center justify-center cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(node.item.id);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </div>
            )}
            {!hasChildren && <div className="w-4" />}
            {isExpanded ? (
              <FolderOpen 
                className={cn(
                  "h-4 w-4", 
                  node.item.color && `text-folder-${node.item.color}`
                )} 
              />
            ) : (
              <Folder 
                className={cn(
                  "h-4 w-4",
                  node.item.color && `text-folder-${node.item.color}`
                )} 
              />
            )}
            <span className="truncate text-sm">{node.item.name}</span>
          </div>
        </div>
        {isExpanded && hasChildren && (
          <div>
            {node.children.map((child) => renderFolderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Define categories and their icons
  const categories = [
    { id: null, name: 'All Files', icon: <FolderOpen className="h-4 w-4 text-primary" /> },
    { id: 'meetings', name: 'Meetings', icon: <Calendar className="h-4 w-4 text-blue-500" /> },
    { id: 'calls', name: 'Calls', icon: <Phone className="h-4 w-4 text-green-500" /> },
    { id: 'emails', name: 'Emails', icon: <Mail className="h-4 w-4 text-purple-500" /> },
    { id: 'marketing', name: 'Marketing', icon: <FileImage className="h-4 w-4 text-orange-500" /> },
    { id: 'proposals', name: 'Proposals', icon: <FileText className="h-4 w-4 text-yellow-500" /> },
    { id: 'customers', name: 'Customer Documents', icon: <Users className="h-4 w-4 text-indigo-500" /> },
    { id: 'others', name: 'Others', icon: <MoreHorizontal className="h-4 w-4 text-gray-500" /> },
    { id: 'personal', name: 'Personal Files', icon: <User className="h-4 w-4 text-red-500" /> },
  ];
  const allCategories = [...categories, ...customCategories];

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 flex-1 overflow-auto">
        {/* Category selector */}
        <div className="mb-6">
          <div className="text-sm font-semibold text-foreground flex items-center justify-between mb-3">
            Document Categories
            <Dialog open={isCreateCategoryOpen} onOpenChange={setIsCreateCategoryOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 transition-smooth hover:bg-gray-100 !hover:text-[#605BFF] hover:scale-105 rounded">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Categories</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="col-span-3"
                      placeholder="Enter category name"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCreateCategory();
                        }
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2">
                      Select Icon
                    </Label>
                    <div className="col-span-3">
                      <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                        {availableIcons.map((iconData) => {
                          const IconComponent = iconData.icon;
                          return (
                            <button
                              key={iconData.name}
                              type="button"
                              onClick={() => setSelectedIcon(iconData.name)}
                              className={cn(
                                "p-2 rounded-md border-2 transition-colors hover:bg-gray-50",
                                selectedIcon === iconData.name
                                  ? "border-purple-500 bg-purple-50"
                                  : "border-gray-200"
                              )}
                              title={iconData.label}
                            >
                              <IconComponent className="h-4 w-4 text-purple-500" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateCategoryOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCategory}>
                    Create
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div>
            <div className="space-y-1">
              {allCategories.map((category) => (
                <div
                  key={category.id}
                  className={cn(
                    "flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer transition-smooth",
                    currentCategory === category.id && "text-primary font-medium bg-file-item-selected",
                    currentCategory !== category.id && "hover:bg-file-item-hover"
                  )}
                  onClick={() => onCategorySelect(category.id)}
                >
                  {category.icon}
                  <span className="text-sm">{category.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Folder tree */}
        <div>
          <div className="text-sm font-semibold text-foreground flex items-center justify-between mb-3">
            Folder Tree
          </div>
          <div>
            <div className="space-y-1">
              <div
                className={cn(
                  "flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer transition-smooth",
                  !currentFolderId && "text-primary font-medium",
                  currentFolderId && "hover:bg-file-item-hover"
                )}
                onClick={() => onFolderSelect(null)}
              >
                <FolderOpen className="h-4 w-4 text-primary" />
                <span>{currentCategory ? allCategories.find(cat => cat.id === currentCategory)?.name || 'All Files' : 'All Files'}</span>
              </div>
              {folderTree.map((node) => renderFolderNode(node))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
